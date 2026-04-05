const express = require('express');
const { agentRegister } = require('../controllers/agentRegistrationController');
const { agentRegisterValidators } = require('../validators/invitationValidators');

const router = express.Router();

router.post('/register', agentRegisterValidators, agentRegister);

module.exports = router;
