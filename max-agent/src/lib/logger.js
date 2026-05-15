'use strict';

function makeLogger(requestId) {
  const prefix = requestId ? `[${requestId}]` : '[max-agent]';

  function format(level, message, data) {
    const ts = new Date().toISOString();
    const base = `${ts} ${level} ${prefix} ${message}`;
    if (data !== undefined) {
      try {
        return `${base} ${JSON.stringify(data)}`;
      } catch {
        return `${base} [unserializable data]`;
      }
    }
    return base;
  }

  return {
    info:  (msg, data) => console.log(format('INFO ', msg, data)),
    warn:  (msg, data) => console.warn(format('WARN ', msg, data)),
    error: (msg, data) => console.error(format('ERROR', msg, data)),
  };
}

const defaultLogger = makeLogger(null);

module.exports = { makeLogger, log: defaultLogger };
