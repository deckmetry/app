'use strict';

const crypto = require('crypto');
const reputation = require('../agents/reputation');
const { makeLogger } = require('../lib/logger');

/**
 * POST /webhook/project-complete
 *
 * Set this as the webhook URL in a GHL workflow triggered by:
 * - Opportunity Stage Changed → stage = "Project Complete" (or your equivalent stage name)
 *
 * GHL Workflow config:
 *   Trigger: Pipeline Stage Changed
 *   Filter: Pipeline = "Concept Sales Pipeline" AND Stage = "Project Complete"
 *   Action: Webhook → POST this URL
 */
async function handler(req, res) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const log = makeLogger(requestId);

  // Acknowledge immediately
  res.status(200).json({ received: true, requestId });

  log.info('ProjectComplete webhook: received', {
    contactId: req.body.contactId,
    opportunity: req.body.opportunityId,
  });

  // Guard: only act on the configured pipeline + stage
  const expectedPipeline = process.env.GHL_COMPLETE_PIPELINE || 'Concept Sales Pipeline';
  const expectedStage    = process.env.GHL_COMPLETE_STAGE    || 'Project Complete';

  if (req.body.pipelineName && req.body.pipelineName !== expectedPipeline) {
    log.info('ProjectComplete: skipped — pipeline mismatch', { received: req.body.pipelineName });
    return;
  }
  if (req.body.stageName && req.body.stageName !== expectedStage) {
    log.info('ProjectComplete: skipped — stage mismatch', { received: req.body.stageName });
    return;
  }

  reputation.enrollPostCompletion(req.body, requestId).catch((err) => {
    log.error('ProjectComplete webhook: enrollment failed', {
      message: err.message,
      stack: err.stack,
    });
  });
}

module.exports = { handler };
