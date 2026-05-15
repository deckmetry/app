'use strict';

require('dotenv').config();

const express    = require('express');
const crypto     = require('crypto');
const scheduler  = require('./lib/scheduler');
const { log }    = require('./lib/logger');

const newLeadWebhook       = require('./webhooks/new-lead');
const projectCompleteWebhook = require('./webhooks/project-complete');
const dashboardRoutes      = require('./routes/dashboard');
const anomaly              = require('./agents/anomaly');
const reputation           = require('./agents/reputation');
const weeklyAudit          = require('./agents/weekly-audit');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));

// Webhook secret check for all /webhook/* routes
function isAuthorized(req) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true; // dev-only bypass
  const fromHeader = req.headers['x-webhook-secret'];
  const fromQuery  = req.query.secret;
  return fromHeader === secret || fromQuery === secret;
}

function webhookAuth(req, res, next) {
  if (!isAuthorized(req)) {
    log.warn('Rejected: webhook secret mismatch', { path: req.path });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── Webhook routes ────────────────────────────────────────────────────────────

app.post('/webhook/new-lead',         webhookAuth, newLeadWebhook.handler);
app.post('/webhook/project-complete', webhookAuth, projectCompleteWebhook.handler);

// ── Dashboard / API routes ────────────────────────────────────────────────────

app.use('/api', dashboardRoutes);

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  service: 'max-agent',
  uptime: Math.floor(process.uptime()),
}));

// ── Scheduled jobs ────────────────────────────────────────────────────────────

// Every hour — sync latest Google Ads spend
scheduler.register('sync-ad-spend', '0 * * * *', async () => {
  await anomaly.syncAdSpend();
});

// Daily at 1am UTC — recompute CPL metrics for last 30 days
scheduler.register('recompute-cpl', '0 1 * * *', async () => {
  anomaly.recomputeAllCpl();
});

// Daily at 2am UTC — run anomaly detection (after CPL is fresh)
scheduler.register('anomaly-check', '0 2 * * *', async () => {
  await anomaly.runAnomalyCheck();
});

// Every 15 minutes — process due review/referral sequence steps
scheduler.register('sequence-runner', '*/15 * * * *', async () => {
  await reputation.processDueSteps();
});

// Monday 8am UTC — weekly lead generation audit
scheduler.register('weekly-audit', '0 8 * * 1', async () => {
  await weeklyAudit.runWeeklyAudit();
});

// ── Boot ──────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  log.info(`MAX agent listening on port ${PORT}`);
  log.info('Scheduled jobs: ad-spend sync (hourly), CPL recompute (1am), anomaly check (2am), sequences (15min), weekly audit (Mon 8am UTC)');

  // On first boot, do an immediate ad-spend sync so the DB isn't empty
  anomaly.syncAdSpend().catch((err) => {
    log.warn('Boot: initial ad-spend sync failed (non-fatal)', { message: err.message });
  });
});

process.on('SIGTERM', () => {
  log.info('SIGTERM received — shutting down');
  scheduler.stopAll();
  process.exit(0);
});
