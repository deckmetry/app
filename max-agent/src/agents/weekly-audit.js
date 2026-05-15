'use strict';

const db = require('../storage/db');
const ghl = require('../integrations/ghl');
const googleAds = require('../integrations/google-ads');
const claude = require('../integrations/claude');
const { log } = require('../lib/logger');

/**
 * Assemble all data and generate the weekly Lead Generation Audit.
 * Delivers the report as a GHL note on Renan's contact record + logs it.
 * Called every Monday at 8am UTC by the scheduler.
 */
async function runWeeklyAudit() {
  log.info('WeeklyAudit: starting');

  const now          = new Date();
  const oneWeekAgo   = new Date(now.getTime() - 7  * 86400_000);
  const twoWeeksAgo  = new Date(now.getTime() - 14 * 86400_000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 86400_000);

  const fmtDate = (d) => d.toISOString().split('T')[0];

  // ── Lead volume data ───────────────────────────────────────────────────────
  let weeklyLeads;
  try {
    weeklyLeads = await ghl.getWeeklyLeadSummary(5);
  } catch (err) {
    log.warn('WeeklyAudit: GHL lead pull failed', { message: err.message });
    weeklyLeads = null;
  }

  // Current week vs last week from local DB (faster, no GHL rate limit)
  const currentWeekLeadsDb   = db.countLeadsBySource(oneWeekAgo.toISOString(), now.toISOString());
  const lastWeekLeadsDb      = db.countLeadsBySource(twoWeeksAgo.toISOString(), oneWeekAgo.toISOString());
  const trailing4wLeadsDb    = db.countLeadsBySource(fourWeeksAgo.toISOString(), now.toISOString());

  const currentTotal = currentWeekLeadsDb.reduce((s, r) => s + r.lead_count, 0);
  const lastTotal    = lastWeekLeadsDb.reduce((s, r) => s + r.lead_count, 0);
  const t4wTotal     = trailing4wLeadsDb.reduce((s, r) => s + r.lead_count, 0);

  // ── Google Ads spend ───────────────────────────────────────────────────────
  let campaignSummary, totalSpendThisWeek, totalSpendLastWeek;
  try {
    campaignSummary    = await googleAds.getCampaignSpendSummary(fmtDate(oneWeekAgo), fmtDate(now));
    totalSpendThisWeek = campaignSummary.reduce((s, c) => s + c.spend, 0);
    totalSpendLastWeek = (await googleAds.getTotalSpend(fmtDate(twoWeeksAgo), fmtDate(oneWeekAgo)));
  } catch (err) {
    log.warn('WeeklyAudit: Google Ads pull failed', { message: err.message });
    campaignSummary    = null;
    totalSpendThisWeek = null;
    totalSpendLastWeek = null;
  }

  // ── CPL metrics ────────────────────────────────────────────────────────────
  const cplLatest = db.getLatestCpl();

  // ── Missed calls ───────────────────────────────────────────────────────────
  let missedCalls;
  try {
    missedCalls = await ghl.getMissedCallsWithoutTextback(oneWeekAgo.toISOString());
  } catch (err) {
    log.warn('WeeklyAudit: missed calls pull failed', { message: err.message });
    missedCalls = null;
  }

  // ── Won deals ─────────────────────────────────────────────────────────────
  let wonDeals;
  try {
    wonDeals = await ghl.getWonOpportunities(fourWeeksAgo.toISOString(), now.toISOString());
  } catch (err) {
    log.warn('WeeklyAudit: won deals pull failed', { message: err.message });
    wonDeals = null;
  }

  // ── Unacknowledged alerts ──────────────────────────────────────────────────
  const openAlerts = db.getUnacknowledgedAlerts();

  // ── Assemble context for Claude ────────────────────────────────────────────
  const auditData = {
    weekEnding:   fmtDate(now),
    weekStart:    fmtDate(oneWeekAgo),
    leadVolume: {
      currentWeek:        { total: currentTotal, bySource: currentWeekLeadsDb },
      lastWeek:           { total: lastTotal,    bySource: lastWeekLeadsDb },
      trailing4wTotal:    t4wTotal,
      trailing4wAvgPerWk: Math.round(t4wTotal / 4),
      ghlWeeklyHistory:   weeklyLeads,
    },
    googleAds: {
      thisWeekSpend:   totalSpendThisWeek,
      lastWeekSpend:   totalSpendLastWeek,
      campaigns:       campaignSummary,
      dataAvailable:   campaignSummary !== null,
    },
    cplBySource:    cplLatest,
    missedCalls:    missedCalls ? { count: missedCalls.length, sample: missedCalls.slice(0, 3) } : null,
    wonDeals:       wonDeals ? { count: wonDeals.length } : null,
    openAlerts:     openAlerts.slice(0, 10),
  };

  log.info('WeeklyAudit: data assembled, calling Claude');

  // ── Generate report via Claude ─────────────────────────────────────────────
  const report = await claude.generateWeeklyAudit(auditData);

  log.info('WeeklyAudit: report generated', { length: report.length });
  console.log('\n' + '='.repeat(80));
  console.log('WEEKLY LEAD GENERATION AUDIT');
  console.log('='.repeat(80));
  console.log(report);
  console.log('='.repeat(80) + '\n');

  // ── Deliver the report ─────────────────────────────────────────────────────
  await deliverReport(report, fmtDate(now));

  return report;
}

/**
 * Deliver the weekly audit. Currently sends an SMS summary + logs the full report.
 * The full report is also available at GET /api/audit/latest
 */
async function deliverReport(report, weekEnding) {
  const alertContactId = process.env.ALERT_CONTACT_ID;
  const alertPhone     = process.env.ALERT_PHONE;

  if (!alertContactId || !alertPhone) {
    log.warn('WeeklyAudit: ALERT_CONTACT_ID or ALERT_PHONE not set — report only logged');
    return;
  }

  // Extract just the one-line summary for the SMS notification
  const summaryLine = extractSummaryLine(report);
  const smsNotification = `📊 MAX Weekly Audit ready (week ending ${weekEnding}).\n\n${summaryLine}\n\nFull report: ${process.env.MAX_DASHBOARD_URL || '[check logs]'}`;

  try {
    await ghl.sendSms(alertContactId, alertPhone, smsNotification);
    log.info('WeeklyAudit: SMS notification sent');
  } catch (err) {
    log.error('WeeklyAudit: failed to send SMS notification', { message: err.message });
  }
}

function extractSummaryLine(report) {
  // Pull the "One-line summary" from the AUDIT HEADER section
  const match = report.match(/one-line summary[:\s]+(.+)/i);
  if (match) return match[1].trim();

  // Fallback: first non-header line
  const lines = report.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  return lines[0]?.trim() ?? 'See full report.';
}

// Store the last generated report in memory for the /api/audit/latest endpoint
let _lastReport = null;
let _lastReportDate = null;

async function runWeeklyAuditAndCache() {
  const report = await runWeeklyAudit();
  _lastReport = report;
  _lastReportDate = new Date().toISOString();
  return report;
}

function getLastReport() {
  return { report: _lastReport, generatedAt: _lastReportDate };
}

module.exports = { runWeeklyAudit: runWeeklyAuditAndCache, getLastReport };
