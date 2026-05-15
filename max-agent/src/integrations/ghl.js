'use strict';

const axios = require('axios');

const BASE = 'https://services.leadconnectorhq.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  };
}

function locationId() {
  return process.env.GHL_LOCATION_ID;
}

async function ghlGet(path, params = {}) {
  const res = await axios.get(`${BASE}${path}`, {
    headers: headers(),
    params,
    timeout: 15000,
  });
  return res.data;
}

async function ghlPost(path, body) {
  const res = await axios.post(`${BASE}${path}`, body, {
    headers: headers(),
    timeout: 15000,
  });
  return res.data;
}

// ── Contacts ──────────────────────────────────────────────────────────────────

async function getContact(contactId) {
  const data = await ghlGet(`/contacts/${contactId}`);
  return data.contact;
}

// ── Opportunities / Pipeline ──────────────────────────────────────────────────

async function getOpportunity(opportunityId) {
  const data = await ghlGet(`/opportunities/${opportunityId}`);
  return data.opportunity;
}

/**
 * Pull all opportunities created in a date range, paginates automatically.
 * GHL returns max 100 per page.
 */
async function getOpportunitiesByDateRange(startDate, endDate) {
  const all = [];
  let page = 1;

  while (true) {
    const data = await ghlGet('/opportunities/search', {
      location_id: locationId(),
      startAfter: startDate,
      startAt: endDate,
      limit: 100,
      page,
    });

    const ops = data?.opportunities ?? [];
    all.push(...ops);

    if (ops.length < 100) break;
    page++;
  }

  return all;
}

/**
 * Pull all opportunities regardless of date — used for lead-volume counts.
 * Filters in-memory by created_at to avoid GHL pagination edge cases.
 */
async function getLeadsBySource(fromIso, toIso) {
  const ops = await getOpportunitiesByDateRange(fromIso, toIso);
  const bySource = {};

  for (const op of ops) {
    const source = op.source || 'unknown';
    bySource[source] = (bySource[source] || 0) + 1;
  }

  return bySource; // { 'Google Ads': 14, 'Facebook': 6, ... }
}

// ── Messages / SMS ────────────────────────────────────────────────────────────

/**
 * Send an SMS to a contact via GHL Conversations API.
 */
async function sendSms(contactId, toNumber, message) {
  return ghlPost('/conversations/messages', {
    type: 'SMS',
    contactId,
    fromNumber: process.env.GHL_FROM_NUMBER,
    toNumber,
    message,
  });
}

/**
 * Send an email to a contact via GHL Conversations API.
 */
async function sendEmail(contactId, toEmail, subject, html) {
  return ghlPost('/conversations/messages', {
    type: 'Email',
    contactId,
    from: `Concept Design + Build <${process.env.GHL_FROM_EMAIL || 'no-reply@conceptdesignandbuild.com'}>`,
    to: [toEmail],
    subject,
    html,
  });
}

// ── Missed Calls ─────────────────────────────────────────────────────────────

/**
 * Returns missed-call conversations without a text-back reply.
 * Looks at conversations where the last message type was 'Call' (missed).
 */
async function getMissedCallsWithoutTextback(since) {
  const data = await ghlGet('/conversations/search', {
    locationId: locationId(),
    startAfter: since,
    limit: 100,
    sort: 'desc',
  });

  const conversations = data?.conversations ?? [];
  const missed = conversations.filter((c) => {
    return c.lastMessageType === 'Call' && c.unreadCount > 0;
  });

  return missed;
}

// ── Reporting helpers ─────────────────────────────────────────────────────────

/**
 * Pull lead counts with source, grouped by week, for the trailing N weeks.
 * Returns structured data the audit agent needs.
 */
async function getWeeklyLeadSummary(weeks = 5) {
  const results = [];
  const now = new Date();

  for (let i = 0; i < weeks; i++) {
    const to = new Date(now);
    to.setDate(to.getDate() - i * 7);
    const from = new Date(to);
    from.setDate(from.getDate() - 7);

    const bySource = await getLeadsBySource(from.toISOString(), to.toISOString());
    const total = Object.values(bySource).reduce((s, n) => s + n, 0);

    results.unshift({
      weekStart: from.toISOString().split('T')[0],
      weekEnd:   to.toISOString().split('T')[0],
      total,
      bySource,
    });
  }

  return results; // newest last → easy to compare week-over-week
}

/**
 * Count opportunities that reached a "won" stage (e.g. "Approved" or "Project Complete").
 * Used to compute close rate by source.
 */
async function getWonOpportunities(fromIso, toIso) {
  const ops = await getOpportunitiesByDateRange(fromIso, toIso);
  return ops.filter((op) => op.status === 'won');
}

module.exports = {
  getContact,
  getOpportunity,
  getOpportunitiesByDateRange,
  getLeadsBySource,
  sendSms,
  sendEmail,
  getMissedCallsWithoutTextback,
  getWeeklyLeadSummary,
  getWonOpportunities,
};
