const express = require('express');
const humanAuth = require('../middleware/humanAuth');
const csrfProtection = require('../middleware/csrfProtection');
const humanAuthController = require('../controllers/humanAuthController');
const { humanAccept } = require('../controllers/invitationPublicController');
const { loginValidators, updateProfileValidators } = require('../validators/humanAuthValidators');
const { humanAcceptInviteValidators } = require('../validators/invitationValidators');

const router = express.Router();

router.post('/login', loginValidators, humanAuthController.login);
router.post('/logout', humanAuth, csrfProtection, humanAuthController.logout);
router.get('/me', humanAuth, humanAuthController.getMe);
router.patch('/me', humanAuth, csrfProtection, updateProfileValidators, humanAuthController.updateProfile);
router.post('/accept-invite', humanAcceptInviteValidators, humanAccept);

module.exports = router;
