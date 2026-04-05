const express = require('express');
const { verifyToken } = require('../controllers/invitationPublicController');

const router = express.Router();

router.get('/verify/:token', verifyToken);

module.exports = router;
