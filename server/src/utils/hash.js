const crypto = require('crypto');

function normalizeCode(code) {
  return String(code || '').trim().toLowerCase();
}

function hashAccessCode(code, pepper) {
  const normalized = normalizeCode(code);
  return crypto
    .createHash('sha256')
    .update(`${pepper}:${normalized}`, 'utf8')
    .digest('hex');
}

function getCodeLast4(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return '';
  return normalized.slice(-4);
}

module.exports = {
  normalizeCode,
  hashAccessCode,
  getCodeLast4,
};
