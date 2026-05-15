'use strict';

const cron = require('node-cron');
const { log } = require('./logger');

const jobs = [];

/**
 * Register a cron job. Expression uses standard 5-field cron syntax.
 * All times are UTC (Railway containers run UTC).
 */
function register(name, expression, fn) {
  const job = cron.schedule(expression, async () => {
    log.info(`Cron: starting "${name}"`);
    const start = Date.now();
    try {
      await fn();
      log.info(`Cron: "${name}" finished`, { ms: Date.now() - start });
    } catch (err) {
      log.error(`Cron: "${name}" failed`, { message: err.message, stack: err.stack });
    }
  }, { timezone: 'UTC' });

  jobs.push({ name, job });
  log.info(`Cron: registered "${name}" → ${expression}`);
}

function stopAll() {
  jobs.forEach(({ name, job }) => {
    job.stop();
    log.info(`Cron: stopped "${name}"`);
  });
}

module.exports = { register, stopAll };
