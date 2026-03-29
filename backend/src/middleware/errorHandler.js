const config = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (config.nodeEnv !== 'production') {
    console.error(err.stack);
  }

  res.status(500).json({
    success: false,
    error_code: 'INTERNAL_ERROR',
    error_message: 'An unexpected error occurred',
  });
}

module.exports = errorHandler;
