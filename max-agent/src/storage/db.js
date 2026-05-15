'use strict';

// node:sqlite is built into Node 22+ — no native compilation required.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const { log } = require('../lib/logger');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../max-agent.db');
let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
    migrate(db);
    log.info('SQLite ready', { path: DB_PATH });
  }
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      ghl_contact_id  TEXT NOT NULL,
      ghl_opportunity_id TEXT,
      source          TEXT NOT NULL DEFAULT 'unknown',
      pipeline_name   TEXT,
      stage_name      TEXT,
      first_name      TEXT,
      last_name       TEXT,
      email           TEXT,
      phone           TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      raw_payload     TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_leads_contact  ON leads(ghl_contact_id);
    CREATE INDEX IF NOT EXISTS idx_leads_source   ON leads(source);
    CREATE INDEX IF NOT EXISTS idx_leads_created  ON leads(created_at);

    CREATE TABLE IF NOT EXISTS ad_spend (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      date          TEXT NOT NULL,
      source        TEXT NOT NULL,
      campaign_id   TEXT,
      campaign_name TEXT,
      spend         REAL NOT NULL DEFAULT 0,
      impressions   INTEGER NOT NULL DEFAULT 0,
      clicks        INTEGER NOT NULL DEFAULT 0,
      pulled_at     TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(date, campaign_id)
    );

    CREATE INDEX IF NOT EXISTS idx_spend_date   ON ad_spend(date);
    CREATE INDEX IF NOT EXISTS idx_spend_source ON ad_spend(source);

    CREATE TABLE IF NOT EXISTS cpl_metrics (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT NOT NULL,
      source      TEXT NOT NULL,
      spend       REAL NOT NULL DEFAULT 0,
      lead_count  INTEGER NOT NULL DEFAULT 0,
      cpl         REAL,
      computed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(date, source)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      type            TEXT NOT NULL,
      severity        TEXT NOT NULL,
      message         TEXT NOT NULL,
      recommendation  TEXT,
      data            TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      acknowledged_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sequences (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      ghl_contact_id     TEXT NOT NULL,
      ghl_opportunity_id TEXT,
      contact_name       TEXT,
      contact_email      TEXT,
      contact_phone      TEXT,
      job_name           TEXT,
      type               TEXT NOT NULL,
      step               INTEGER NOT NULL DEFAULT 1,
      scheduled_at       TEXT NOT NULL,
      sent_at            TEXT,
      response_received_at TEXT,
      cancelled_at       TEXT,
      created_at         TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_seq_contact ON sequences(ghl_contact_id);
    CREATE INDEX IF NOT EXISTS idx_seq_due     ON sequences(scheduled_at, sent_at, cancelled_at);
  `);
}

// ── Lead helpers ─────────────────────────────────────────────────────────────

function insertLead(lead) {
  return getDb().prepare(`
    INSERT INTO leads (ghl_contact_id, ghl_opportunity_id, source, pipeline_name, stage_name,
                       first_name, last_name, email, phone, raw_payload)
    VALUES (:ghl_contact_id, :ghl_opportunity_id, :source, :pipeline_name, :stage_name,
            :first_name, :last_name, :email, :phone, :raw_payload)
  `).run(lead);
}

function countLeadsBySource(fromDate, toDate) {
  return getDb().prepare(`
    SELECT source, COUNT(*) as lead_count
    FROM leads
    WHERE created_at >= ? AND created_at < ?
    GROUP BY source
    ORDER BY lead_count DESC
  `).all(fromDate, toDate);
}

function countLeadsByDay(source, fromDate, toDate) {
  return getDb().prepare(`
    SELECT date(created_at) as day, COUNT(*) as lead_count
    FROM leads
    WHERE source = ? AND created_at >= ? AND created_at < ?
    GROUP BY day
    ORDER BY day ASC
  `).all(source, fromDate, toDate);
}

// ── Ad spend helpers ─────────────────────────────────────────────────────────

function upsertAdSpend(row) {
  getDb().prepare(`
    INSERT INTO ad_spend (date, source, campaign_id, campaign_name, spend, impressions, clicks)
    VALUES (:date, :source, :campaign_id, :campaign_name, :spend, :impressions, :clicks)
    ON CONFLICT(date, campaign_id) DO UPDATE SET
      source        = excluded.source,
      campaign_name = excluded.campaign_name,
      spend         = excluded.spend,
      impressions   = excluded.impressions,
      clicks        = excluded.clicks,
      pulled_at     = datetime('now')
  `).run(row);
}

function getSpendBySource(fromDate, toDate) {
  return getDb().prepare(`
    SELECT source, SUM(spend) as total_spend
    FROM ad_spend
    WHERE date >= ? AND date < ?
    GROUP BY source
  `).all(fromDate, toDate);
}

function getSpendTrend(source, days) {
  return getDb().prepare(`
    SELECT date, SUM(spend) as spend
    FROM ad_spend
    WHERE source = ?
      AND date >= date('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date ASC
  `).all(source, days);
}

// ── CPL metrics helpers ──────────────────────────────────────────────────────

function upsertCplMetric(row) {
  getDb().prepare(`
    INSERT INTO cpl_metrics (date, source, spend, lead_count, cpl)
    VALUES (:date, :source, :spend, :lead_count, :cpl)
    ON CONFLICT(date, source) DO UPDATE SET
      spend       = excluded.spend,
      lead_count  = excluded.lead_count,
      cpl         = excluded.cpl,
      computed_at = datetime('now')
  `).run(row);
}

function getCplHistory(source, days) {
  return getDb().prepare(`
    SELECT date, spend, lead_count, cpl
    FROM cpl_metrics
    WHERE source = ?
      AND date >= date('now', '-' || ? || ' days')
    ORDER BY date ASC
  `).all(source, days);
}

function getLatestCpl() {
  return getDb().prepare(`
    SELECT source,
           AVG(cpl)        as avg_cpl,
           MIN(cpl)        as min_cpl,
           MAX(cpl)        as max_cpl,
           SUM(spend)      as total_spend,
           SUM(lead_count) as total_leads
    FROM cpl_metrics
    WHERE date >= date('now', '-30 days') AND cpl IS NOT NULL
    GROUP BY source
    ORDER BY avg_cpl ASC
  `).all();
}

// ── Alert helpers ────────────────────────────────────────────────────────────

function insertAlert(alert) {
  return getDb().prepare(`
    INSERT INTO alerts (type, severity, message, recommendation, data)
    VALUES (:type, :severity, :message, :recommendation, :data)
  `).run({ ...alert, data: JSON.stringify(alert.data ?? {}) });
}

function getUnacknowledgedAlerts() {
  return getDb().prepare(`
    SELECT * FROM alerts WHERE acknowledged_at IS NULL ORDER BY created_at DESC
  `).all();
}

// ── Sequence helpers ─────────────────────────────────────────────────────────

function insertSequenceStep(step) {
  return getDb().prepare(`
    INSERT INTO sequences (ghl_contact_id, ghl_opportunity_id, contact_name, contact_email,
                           contact_phone, job_name, type, step, scheduled_at)
    VALUES (:ghl_contact_id, :ghl_opportunity_id, :contact_name, :contact_email,
            :contact_phone, :job_name, :type, :step, :scheduled_at)
  `).run(step);
}

function getDueSequenceSteps() {
  return getDb().prepare(`
    SELECT * FROM sequences
    WHERE sent_at IS NULL
      AND cancelled_at IS NULL
      AND scheduled_at <= datetime('now')
    ORDER BY scheduled_at ASC
  `).all();
}

function markSequenceSent(id) {
  getDb().prepare(`UPDATE sequences SET sent_at = datetime('now') WHERE id = ?`).run(id);
}

function cancelContactSequences(ghlContactId, type) {
  getDb().prepare(`
    UPDATE sequences SET cancelled_at = datetime('now')
    WHERE ghl_contact_id = ? AND type = ? AND sent_at IS NULL AND cancelled_at IS NULL
  `).run(ghlContactId, type);
}

function markResponseReceived(ghlContactId, type) {
  getDb().prepare(`
    UPDATE sequences SET response_received_at = datetime('now')
    WHERE ghl_contact_id = ? AND type = ? AND response_received_at IS NULL
  `).run(ghlContactId, type);
}

module.exports = {
  getDb,
  insertLead,
  countLeadsBySource,
  countLeadsByDay,
  upsertAdSpend,
  getSpendBySource,
  getSpendTrend,
  upsertCplMetric,
  getCplHistory,
  getLatestCpl,
  insertAlert,
  getUnacknowledgedAlerts,
  insertSequenceStep,
  getDueSequenceSteps,
  markSequenceSent,
  cancelContactSequences,
  markResponseReceived,
};
