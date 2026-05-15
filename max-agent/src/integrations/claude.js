'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-opus-4-7-20251101';

// System prompt for the Chief of Marketing persona — cached via prompt caching
const SYSTEM_PROMPT = `You are MAX, the Chief of Marketing AI for Concept Design + Build — a premium outdoor living design-build company specializing in decks, roofs, patios, pergolas, outdoor kitchens, and luxury outdoor renovations.

Your mandate: increase the volume of qualified leads entering the pipeline. You own every lead source, every channel, and every dollar of acquisition spend.

You think exclusively in:
- Lead volume by channel
- Cost per QUALIFIED lead (not raw leads, not clicks)
- Channel ROI — spend → qualified leads → proposals → won → revenue
- Close rate by campaign source

You never recommend "spend more on ads" as a reflex. You reallocate first. You look for leaks before buying new traffic.

Your analysis always works down this diagnostic ladder:
1. Are existing channels under-invested?
2. Are there channels not being used (local SEO, LSAs, Houzz/Angi, referrals, yard signs)?
3. Is the website converting?
4. Are capture tools routing into GHL?
5. Are inbound calls answered or recovered?
6. Are referrals systematically requested?
7. Is spend traceable (UTMs, source tags)?

You communicate like a marketing executive briefing a COO: strategic, direct, structured. Lead with the finding and recommendation, then the reasoning. Use numbers. Challenge weak logic.`;

// ── Anomaly Detection ─────────────────────────────────────────────────────────

const ANOMALY_TOOL = {
  name: 'report_anomaly',
  description: 'Report a detected marketing anomaly with severity and recommended action.',
  input_schema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['cpl_spike', 'lead_drop', 'spend_leak', 'volume_anomaly', 'attribution_gap'],
        description: 'The category of anomaly detected.',
      },
      severity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'How urgently this needs attention.',
      },
      message: {
        type: 'string',
        description: 'One sentence: what is wrong and by how much.',
      },
      recommendation: {
        type: 'string',
        description: 'One concrete action to take. Specific and executable.',
      },
      alert_renan: {
        type: 'boolean',
        description: 'True if this warrants an immediate SMS alert to Renan.',
      },
    },
    required: ['type', 'severity', 'message', 'recommendation', 'alert_renan'],
  },
};

/**
 * Analyse CPL and lead-volume data. Returns array of detected anomalies.
 */
async function detectAnomalies(metricsContext) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [ANOMALY_TOOL],
    tool_choice: { type: 'auto' },
    messages: [
      {
        role: 'user',
        content: `Analyse this marketing performance data and call report_anomaly for each significant issue you find. Call it multiple times if there are multiple anomalies. If nothing is anomalous, do not call it.

Data:
${JSON.stringify(metricsContext, null, 2)}

Rules:
- A CPL spike is ≥ 30% above the 4-week average for that source.
- A lead drop is ≥ 25% below trailing 4-week average total.
- A spend leak is spend continuing with zero leads for 7+ days.
- A volume anomaly is overall weekly leads below 50% of 4-week average.
- Only set alert_renan = true for high severity.`,
      },
    ],
  });

  const anomalies = [];
  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'report_anomaly') {
      anomalies.push(block.input);
    }
  }
  return anomalies;
}

// ── Weekly Audit Generation ───────────────────────────────────────────────────

/**
 * Generate the full weekly Lead Generation Audit in the standard template format.
 * auditData = { weeklyLeads, cplMetrics, adSpend, missedCalls, wonDeals, alerts }
 */
async function generateWeeklyAudit(auditData) {
  const today = new Date().toISOString().split('T')[0];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Generate the weekly Lead Generation Audit for the week ending ${today}.

Use EXACTLY this section structure (fill in data from below; where data is missing, state what is missing and add instrumenting it as a Priority Action):

## AUDIT HEADER
## SECTION 1 — LEAD VOLUME SCORECARD
## SECTION 2 — LEAKS & GAPS
## SECTION 3 — PAID CHANNEL PERFORMANCE
## SECTION 4 — COST & RETURN
## SECTION 5 — PRIORITIZED ACTIONS

Rules:
- Section 5 actions ranked by lead-volume impact ÷ implementation friction.
- Never recommend "increase spend" before exhausting reallocation.
- If attribution is broken or partial, fixing it is action #1.
- Every action states: what to do, expected effect, effort level, who/what executes.
- Include a one-line week-over-week summary at the top.

Data available:
${JSON.stringify(auditData, null, 2)}`,
      },
    ],
  });

  return response.content[0]?.text ?? '(no content returned)';
}

// ── Review / Referral Message Generation ─────────────────────────────────────

/**
 * Generate a personalised review request SMS for a completed project.
 */
async function generateReviewRequest(step, customerName, jobName) {
  const prompts = {
    1: `Write a warm, conversational SMS review request. The customer (${customerName}) just had their "${jobName}" project completed by Concept Design + Build. Ask them to leave a Google review. Keep it under 160 characters. No hashtags. Sound human, not corporate. Include a short placeholder: [GOOGLE_REVIEW_LINK]`,
    2: `Write a brief follow-up SMS (2nd attempt) for ${customerName} whose "${jobName}" project is complete. Gently mention the review request again. Acknowledge they may have been busy. Under 160 characters. Include [GOOGLE_REVIEW_LINK]`,
  };

  const prompt = prompts[step] ?? prompts[1];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0]?.text?.trim() ?? '';
}

/**
 * Generate a referral ask SMS for a satisfied customer.
 */
async function generateReferralAsk(customerName, jobName) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: `Write a referral ask SMS to ${customerName} who had their "${jobName}" completed by Concept Design + Build. Ask if they know anyone who might want a similar project done. Mention we prioritise referred clients. Keep it under 160 characters. Sound human and grateful.`,
      },
    ],
  });

  return response.content[0]?.text?.trim() ?? '';
}

module.exports = {
  detectAnomalies,
  generateWeeklyAudit,
  generateReviewRequest,
  generateReferralAsk,
};
