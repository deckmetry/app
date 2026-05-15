'use strict';

const crypto = require('crypto');
const intake = require('../agents/intake');
const { makeLogger } = require('../lib/logger');

/**
 * POST /webhook/new-lead
 *
 * Set this as the webhook URL in a GHL workflow triggered by:
 * - Contact Created
 * - Opportunity Created
 *
 * GHL Workflow config:
 *   Action type: Webhook
 *   URL: https://your-max-agent.railway.app/webhook/new-lead?secret=WEBHOOK_SECRET
 *   Method: POST
 *   Body: all contact/opportunity fields
 */
async function handler(req, res) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const log = makeLogger(requestId);

  // Acknowledge immediately — GHL has a short timeout
  res.status(200).json({ received: true, requestId });

  log.info('NewLead webhook: received', { body: req.body });

  intake.processNewLead(req.body, requestId).catch((err) => {
    log.error('NewLead webhook: processing failed', {
      message: err.message,
      stack: err.stack,
    });
  });
}

module.exports = { handler };
