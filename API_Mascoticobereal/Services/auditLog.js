const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'security.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(evento, detalles = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    evento,
    ...detalles,
  };
  const line = JSON.stringify(entry) + '\n';
  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) console.error('[AuditLog] Error escribiendo log:', err.message);
  });
}

module.exports = { log };
