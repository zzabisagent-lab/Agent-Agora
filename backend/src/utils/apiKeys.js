const crypto = require('crypto');
const bcrypt = require('bcrypt');
const config = require('../config/env');

async function generateApiKey(prefix) {
  const rawKey = prefix + crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(rawKey, config.bcryptSaltRounds);
  const last4 = rawKey.slice(-4);
  return { rawKey, hash, last4 };
}

async function compareApiKey(rawKey, hash) {
  return bcrypt.compare(rawKey, hash);
}

module.exports = { generateApiKey, compareApiKey };
