const crypto = require('crypto');
const config = require('../config/env');

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfCookie(res, token) {
  res.cookie(config.csrf.cookieName, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    path: '/',
  });
}

module.exports = { generateCsrfToken, setCsrfCookie };
