'use strict';

const db = require('../storage/db');
const ghl = require('../integrations/ghl');
const googleAds = require('../integrations/google-ads');
const claude = require('../integrations/claude');
const { log } = require('../lib/logger');

/**
 * Sync today's Google Ads spend into the database.
 * Called hourly by the scheduler.
 */
async function syncAdSpend() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400_000).toISOString().split('T')[0];

  // Pull last 2 days so today's partial data updates cleanly
  const rows = await googleAds.getSpendRowsForStorage(yesterday, today);
  for (const row of rows) {
    db.upsertAdSpend(row);
  }

  log.info('Anomaly: synced ad spend', { rows: rows.length, today });
}

/**
 * Recompute CPL metrics for each source for a given date.
 * Joins ad spend with lead counts from the leads table.
 */
function recomputeCplForDate(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const toDate = nextDay.toISOString().split('T')[0];

  const spendRows  = db.getSpendBySource(date, toDate);
  const leadCounts = db.countLeadsBySource(`${date}T00:00:00`, `${toDate}T00:00:00`);

  // Index lead counts by source
  const lcBySource = {};
  for (const row of leadCounts) {
    lcBySource[row.source] = row.lead_count;
  }

  // Index spend by source
  const spendBySource = {};
  for (const row of spendRows) {
    spendBySource[row.source] = row.total_spend;
  }

  // All sources from both sets
  const allSources = new Set([...Object.keys(lcBySource), ...Object.keys(spendBySource)]);

  for (const source of allSources) {
    const spend      = spendBySource[source] || 0;
    const lead_count = lcBySource[source] || 0;
    const cpl        = lead_count > 0 ? spend / lead_count : null;

    db.upsertCplMetric({ date, source, spend, lead_count, cpl });
  }
}

/**
 * Run the full CPL recompute for the last 30 days.
 * Called daily by the scheduler.
 */
function recomputeAllCpl() {
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    recomputeCplForDate(d.toISOString().split('T')[0]);
  }
  log.info('Anomaly: CPL metrics recomputed for last 30 days');
}

/**
 * Build the metrics context object for Claude anomaly detection.
 */
async function buildMetricsContext() {
  // 4-week rolling window
  const fourWeeksAgo = new Date(Date.now() - 28 * 86400_000).toISOString();
  const oneWeekAgo   = new Date(Date.now() -  7 * 86400_000).toISOString();
  const now          = new Date().toISOString();

  const currentWeekLeads = db.countLeadsBySource(oneWeekAgo, now);
  const trailing4wLeads  = db.countLeadsBySource(fourWeeksAgo, now);

  const currentWeekTotal = currentWeekLeads.reduce((s, r) => s + r.lead_count, 0);
  const trailing4wTotal  = trailing4wLeads.reduce((s, r) => s + r.lead_count, 0);
  const trailing4wAvgPerWeek = trailing4wTotal / 4;

  const cplLatest = db.getLatestCpl();

  // Per-source CPL history for trend analysis
  const cplHistory = {};
  for (const row of cplLatest) {
    cplHistory[row.source] = {
      avg_cpl:      row.avg_cpl,
      total_spend:  row.total_spend,
      total_leads:  row.total_leads,
      history:      db.getCplHistory(row.source, 30),
    };
  }

  return {
    currentWeek: {
      total: currentWeekTotal,
      bySource: currentWeekLeads,
    },
    trailing4wAvgPerWeek,
    cplBySource: cplHistory,
    asOf: new Date().toISOString(),
  };
}

/**
 * Detect anomalies and persist + alert any that are found.
 * Called daily by the scheduler.
 */
async function runAnomalyCheck() {
  log.info('Anomaly: starting anomaly check');

  const metricsContext = await buildMetricsContext();
  const anomalies = await claude.detectAnomalies(metricsContext);

  for (const anomaly of anomalies) {
    db.insertAlert({
      type:           anomaly.type,
      severity:       anomaly.severity,
      message:        anomaly.message,
      recommendation: anomaly.recommendation,
      data:           metricsContext,
    });

    log.info('Anomaly: alert saved', { type: anomaly.type, severity: anomaly.severity });

    if (anomaly.alert_renan) {
      await alertRenan(anomaly);
    }
  }

  log.info('Anomaly: check complete', { anomaliesFound: anomalies.length });
}

async function alertRenan(anomaly) {
  const alertContactId = process.env.ALERT_CONTACT_ID;
  const alertPhone     = process.env.ALERT_PHONE;

  if (!alertContactId || !alertPhone) {
    log.warn('Anomaly: ALERT_CONTACT_ID or ALERT_PHONE not set — skipping SMS alert');
    return;
  }

  const emoji = anomaly.severity === 'high' ? '🚨' : '⚠️';
  const message = `${emoji} MAX Alert: ${anomaly.message}\n\nFix: ${anomaly.recommendation}`;

  try {
    await ghl.sendSms(alertContactId, alertPhone, message);
    log.info('Anomaly: alert SMS sent to Renan');
  } catch (err) {
    log.error('Anomaly: failed to send alert SMS', { message: err.message });
  }
}

module.exports = { syncAdSpend, recomputeAllCpl, recomputeCplForDate, runAnomalyCheck };
