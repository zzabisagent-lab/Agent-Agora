const express = require('express');
const router = express.Router();
const flexAuth = require('../middleware/flexAuth');
const { handleVerify } = require('../controllers/verificationController');

// POST /verify - action=request|submit|resolve|bypass
router.post('/', flexAuth, handleVerify);

module.exports = router;
