'use strict';

const db = require('../storage/db');
const ghl = require('../integrations/ghl');
const claude = require('../integrations/claude');
const { makeLogger, log } = require('../lib/logger');

// Sequence timing (days after project completion)
const REVIEW_STEP1_DAYS  = 3;
const REVIEW_STEP2_DAYS  = 7;
const REFERRAL_STEP_DAYS = 14;

const GOOGLE_REVIEW_LINK = process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/YOUR_REVIEW_LINK';

/**
 * Enroll a completed project customer in the review + referral sequence.
 * Called when the "project complete" webhook fires.
 */
async function enrollPostCompletion(payload, requestId) {
  const log = makeLogger(requestId);

  const contactId = payload.contactId || payload.id;
  const contactName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'there';
  const jobName = payload.jobName || payload.opportunityName || 'your project';

  log.info('Reputation: enrolling contact in sequences', { contactId, jobName });

  function scheduleAt(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    // Send during business hours: aim for ~10am local (store UTC, adjust if needed)
    d.setUTCHours(15, 0, 0, 0); // 15:00 UTC = ~10am CST
    return d.toISOString();
  }

  const base = {
    ghl_contact_id:    contactId,
    ghl_opportunity_id: payload.opportunityId || null,
    contact_name:      contactName,
    contact_email:     payload.email || null,
    contact_phone:     payload.phone || null,
    job_name:          jobName,
  };

  db.insertSequenceStep({ ...base, type: 'review',   step: 1, scheduled_at: scheduleAt(REVIEW_STEP1_DAYS) });
  db.insertSequenceStep({ ...base, type: 'review',   step: 2, scheduled_at: scheduleAt(REVIEW_STEP2_DAYS) });
  db.insertSequenceStep({ ...base, type: 'referral', step: 1, scheduled_at: scheduleAt(REFERRAL_STEP_DAYS) });

  log.info('Reputation: sequence steps created', {
    reviewStep1:  scheduleAt(REVIEW_STEP1_DAYS),
    reviewStep2:  scheduleAt(REVIEW_STEP2_DAYS),
    referralStep: scheduleAt(REFERRAL_STEP_DAYS),
  });
}

/**
 * Process all due sequence steps. Called every 15 minutes by the scheduler.
 */
async function processDueSteps() {
  const due = db.getDueSequenceSteps();
  if (due.length === 0) return;

  log.info(`Reputation: processing ${due.length} due sequence step(s)`);

  for (const step of due) {
    try {
      await processStep(step);
      db.markSequenceSent(step.id);
      log.info('Reputation: step sent', { id: step.id, type: step.type, step: step.step });
    } catch (err) {
      log.error('Reputation: step failed', { id: step.id, message: err.message });
    }
  }
}

async function processStep(step) {
  if (step.type === 'review') {
    await sendReviewRequest(step);
  } else if (step.type === 'referral') {
    await sendReferralAsk(step);
  }
}

async function sendReviewRequest(step) {
  const message = await claude.generateReviewRequest(step.step, step.contact_name, step.job_name);
  const finalMessage = message.replace('[GOOGLE_REVIEW_LINK]', GOOGLE_REVIEW_LINK);

  if (step.contact_phone) {
    await ghl.sendSms(step.ghl_contact_id, step.contact_phone, finalMessage);
  } else if (step.contact_email) {
    const html = `<p>${finalMessage.replace(/\n/g, '<br>')}</p>`;
    await ghl.sendEmail(step.ghl_contact_id, step.contact_email, 'Quick favour — your Google review', html);
  }
}

async function sendReferralAsk(step) {
  // Skip referral if step 1 review never got a response (contact likely disengaged)
  const reviewSteps = db.getDueSequenceSteps(); // reuse — already filtered to unsent
  // Note: we don't gate referrals on review response for now; simplest path first.

  const message = await claude.generateReferralAsk(step.contact_name, step.job_name);

  if (step.contact_phone) {
    await ghl.sendSms(step.ghl_contact_id, step.contact_phone, message);
  } else if (step.contact_email) {
    const html = `<p>${message.replace(/\n/g, '<br>')}</p>`;
    await ghl.sendEmail(step.ghl_contact_id, step.contact_email, 'Know anyone who might love an outdoor space?', html);
  }
}

module.exports = { enrollPostCompletion, processDueSteps };
