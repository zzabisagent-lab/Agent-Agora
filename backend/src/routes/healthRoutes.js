const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/live', (_req, res) => {
  res.json({ success: true, data: { status: 'alive' } });
});

router.get('/ready', (_req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.json({ success: true, data: { status: 'ready', mongo: 'connected' } });
  }
  return res.status(503).json({
    success: false,
    error_code: 'SERVICE_UNAVAILABLE',
    error_message: 'Database not ready',
  });
});

module.exports = router;
