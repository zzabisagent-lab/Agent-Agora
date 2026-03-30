const express = require('express');
const humanAuth = require('../middleware/humanAuth');
const csrfProtection = require('../middleware/csrfProtection');
const humanAuthController = require('../controllers/humanAuthController');
const { loginValidators, updateProfileValidators } = require('../validators/humanAuthValidators');

const router = express.Router();

router.post('/login', loginValidators, humanAuthController.login);
router.post('/logout', humanAuth, csrfProtection, humanAuthController.logout);
router.get('/me', humanAuth, humanAuthController.getMe);
router.patch('/me', humanAuth, csrfProtection, updateProfileValidators, humanAuthController.updateProfile);

module.exports = router;
