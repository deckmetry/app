'use strict';

const express = require('express');
const db = require('../storage/db');
const anomaly = require('../agents/anomaly');
const weeklyAudit = require('../agents/weekly-audit');
const { log } = require('../lib/logger');

const router = express.Router();

// Simple API-key auth for dashboard endpoints
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (process.env.DASHBOARD_API_KEY && key !== process.env.DASHBOARD_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(requireApiKey);

// GET /api/cpl — CPL by source for last 30 days
router.get('/cpl', (_req, res) => {
  const data = db.getLatestCpl();
  res.json({ ok: true, data });
});

// GET /api/leads?days=30 — lead counts by source
router.get('/leads', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const fromDate = new Date(Date.now() - days * 86400_000).toISOString();
  const toDate   = new Date().toISOString();
  const data = db.countLeadsBySource(fromDate, toDate);
  res.json({ ok: true, data, days });
});

// GET /api/alerts — unacknowledged alerts
router.get('/alerts', (_req, res) => {
  const data = db.getUnacknowledgedAlerts();
  res.json({ ok: true, data });
});

// GET /api/audit/latest — last generated weekly audit report
router.get('/audit/latest', (_req, res) => {
  const { report, generatedAt } = weeklyAudit.getLastReport();
  if (!report) {
    return res.status(404).json({ ok: false, error: 'No audit generated yet. Trigger POST /api/audit/run to generate.' });
  }
  res.json({ ok: true, report, generatedAt });
});

// POST /api/audit/run — trigger audit on demand (Renan can call this any time)
router.post('/audit/run', async (_req, res) => {
  log.info('Dashboard: manual audit run triggered');
  res.status(202).json({ ok: true, message: 'Audit started. Check /api/audit/latest in ~60 seconds.' });

  weeklyAudit.runWeeklyAudit().catch((err) => {
    log.error('Dashboard: manual audit failed', { message: err.message });
  });
});

// POST /api/anomaly/check — trigger anomaly check on demand
router.post('/anomaly/check', async (_req, res) => {
  log.info('Dashboard: manual anomaly check triggered');
  res.status(202).json({ ok: true, message: 'Anomaly check started.' });

  anomaly.runAnomalyCheck().catch((err) => {
    log.error('Dashboard: manual anomaly check failed', { message: err.message });
  });
});

module.exports = router;
