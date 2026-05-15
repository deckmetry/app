'use strict';

const db = require('../storage/db');
const { makeLogger } = require('../lib/logger');

/**
 * Process a new lead arriving from a GHL webhook.
 * Logs the lead, updates running metrics.
 */
async function processNewLead(payload, requestId) {
  const log = makeLogger(requestId);

  // Normalise source — GHL sends various formats
  const rawSource = payload.source || payload.leadSource || 'unknown';
  const source = normaliseSource(rawSource);

  log.info('Intake: processing new lead', { source, contactId: payload.contactId });

  db.insertLead({
    ghl_contact_id:     payload.contactId || payload.id,
    ghl_opportunity_id: payload.opportunityId || null,
    source,
    pipeline_name:      payload.pipelineName || null,
    stage_name:         payload.stageName || null,
    first_name:         payload.firstName || null,
    last_name:          payload.lastName || null,
    email:              payload.email || null,
    phone:              payload.phone || null,
    raw_payload:        JSON.stringify(payload),
  });

  log.info('Intake: lead logged', { source });
  return { source };
}

/**
 * Normalise GHL source strings to consistent labels.
 * GHL source values vary — "google ads", "Google Ads Campaign", "fb", etc.
 */
function normaliseSource(raw) {
  const s = (raw || '').toLowerCase().trim();

  if (s.includes('google') && s.includes('ad'))   return 'Google Ads';
  if (s.includes('google') && s.includes('lsa'))  return 'Google LSA';
  if (s.includes('google'))                        return 'Google Organic';
  if (s.includes('facebook') || s.includes('fb') || s.includes('meta')) return 'Meta Ads';
  if (s.includes('instagram'))                     return 'Instagram';
  if (s.includes('referral'))                      return 'Referral';
  if (s.includes('yard sign') || s.includes('sign')) return 'Yard Sign';
  if (s.includes('houzz'))                         return 'Houzz';
  if (s.includes('angi') || s.includes('angie'))  return 'Angi';
  if (s.includes('organic') || s.includes('seo')) return 'Organic Search';
  if (s.includes('direct'))                        return 'Direct';
  if (s.includes('call') || s.includes('phone'))  return 'Inbound Call';
  if (s.includes('chat'))                          return 'Chat Widget';
  if (s.includes('walk'))                          return 'Walk-in';
  if (!raw || s === 'unknown')                     return 'Unknown';

  // Preserve the original if nothing matched — it shows up in dashboards for triage
  return raw;
}

module.exports = { processNewLead, normaliseSource };
