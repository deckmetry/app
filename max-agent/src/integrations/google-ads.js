'use strict';

const axios = require('axios');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ADS_BASE  = 'https://googleads.googleapis.com/v18';

let _cachedToken = null;
let _tokenExpiry = 0;

async function getAccessToken() {
  if (_cachedToken && Date.now() < _tokenExpiry - 60_000) {
    return _cachedToken;
  }

  const res = await axios.post(TOKEN_URL, {
    client_id:     process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    grant_type:    'refresh_token',
  }, { timeout: 10000 });

  _cachedToken = res.data.access_token;
  _tokenExpiry = Date.now() + res.data.expires_in * 1000;
  return _cachedToken;
}

function customerId() {
  return process.env.GOOGLE_ADS_CUSTOMER_ID;
}

function loginCustomerId() {
  return process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
}

async function gaqlQuery(query) {
  const token = await getAccessToken();

  const extraHeaders = {};
  if (loginCustomerId()) {
    extraHeaders['login-customer-id'] = loginCustomerId();
  }

  const res = await axios.post(
    `${ADS_BASE}/customers/${customerId()}/googleAds:searchStream`,
    { query },
    {
      headers: {
        Authorization:          `Bearer ${token}`,
        'developer-token':      process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'Content-Type':         'application/json',
        ...extraHeaders,
      },
      timeout: 30000,
    },
  );

  // searchStream returns an array of batch result objects, each with a results array
  const rows = [];
  for (const batch of res.data) {
    rows.push(...(batch.results ?? []));
  }
  return rows;
}

// ── Campaign performance ──────────────────────────────────────────────────────

/**
 * Returns daily spend, impressions, clicks by campaign for the given date range.
 * Dates are YYYY-MM-DD strings.
 */
async function getCampaignPerformance(fromDate, toDate) {
  const rows = await gaqlQuery(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks
    FROM campaign
    WHERE segments.date BETWEEN '${fromDate}' AND '${toDate}'
      AND campaign.status = 'ENABLED'
    ORDER BY segments.date DESC
  `);

  return rows.map((r) => ({
    campaignId:   r.campaign.id,
    campaignName: r.campaign.name,
    date:         r.segments.date,
    spend:        (r.metrics.costMicros || 0) / 1_000_000,
    impressions:  r.metrics.impressions || 0,
    clicks:       r.metrics.clicks || 0,
  }));
}

/**
 * Aggregate spend by campaign for a date range (sums across days).
 */
async function getCampaignSpendSummary(fromDate, toDate) {
  const rows = await getCampaignPerformance(fromDate, toDate);

  const byId = {};
  for (const r of rows) {
    if (!byId[r.campaignId]) {
      byId[r.campaignId] = {
        campaignId:   r.campaignId,
        campaignName: r.campaignName,
        spend:        0,
        impressions:  0,
        clicks:       0,
      };
    }
    byId[r.campaignId].spend       += r.spend;
    byId[r.campaignId].impressions += r.impressions;
    byId[r.campaignId].clicks      += r.clicks;
  }

  return Object.values(byId).sort((a, b) => b.spend - a.spend);
}

/**
 * Returns total spend across all enabled campaigns for a date range.
 */
async function getTotalSpend(fromDate, toDate) {
  const campaigns = await getCampaignSpendSummary(fromDate, toDate);
  return campaigns.reduce((sum, c) => sum + c.spend, 0);
}

/**
 * Maps campaign names to GHL source labels using a simple naming convention.
 * The convention: if the campaign name contains "google" → "Google Ads".
 * Campaigns named with a source prefix like "[Brand]" or "[RLSA]" get that as source.
 * Everything falls through to "Google Ads" since all campaigns in this account are Google.
 */
function campaignToSource(campaignName) {
  // Future: allow env-configured overrides via GOOGLE_ADS_SOURCE_MAP (JSON)
  const mapEnv = process.env.GOOGLE_ADS_SOURCE_MAP;
  if (mapEnv) {
    try {
      const map = JSON.parse(mapEnv);
      for (const [pattern, source] of Object.entries(map)) {
        if (campaignName.toLowerCase().includes(pattern.toLowerCase())) {
          return source;
        }
      }
    } catch { /* ignore bad JSON */ }
  }
  return 'Google Ads';
}

/**
 * Returns per-day spend rolled up to source label, for DB storage.
 */
async function getSpendRowsForStorage(fromDate, toDate) {
  const rows = await getCampaignPerformance(fromDate, toDate);
  return rows.map((r) => ({
    date:          r.date,
    source:        campaignToSource(r.campaignName),
    campaign_id:   String(r.campaignId),
    campaign_name: r.campaignName,
    spend:         r.spend,
    impressions:   r.impressions,
    clicks:        r.clicks,
  }));
}

module.exports = {
  getCampaignPerformance,
  getCampaignSpendSummary,
  getTotalSpend,
  getSpendRowsForStorage,
  campaignToSource,
};
