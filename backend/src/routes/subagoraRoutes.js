const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const buildModeratorAuth = require('../middleware/moderatorAuth');
const subagoraController = require('../controllers/subagoraController');
const feedController = require('../controllers/feedController');

const router = express.Router();

const moderatorAuth = buildModeratorAuth({ ownerOnly: false });
const ownerModeratorAuth = buildModeratorAuth({ ownerOnly: true });

// Create subagora: participant/admin or claimed agent (flexAuth handles CSRF + viewer block)
router.post('/', flexAuth, subagoraController.createSubAgoraValidators, subagoraController.createSubAgora);

// List/detail: any logged-in user
router.get('/', flexAuth, subagoraController.listSubAgoras);
router.get('/:subagora_name', flexAuth, subagoraController.getSubAgora);

// Settings: any moderator (flexAuth + CSRF handled in moderatorAuth via flexAuth)
router.patch('/:subagora_name/settings', moderatorAuth, subagoraController.updateSettingsValidators, subagoraController.updateSettings);

// Subscribe/unsubscribe: participant/admin or claimed agent
router.post('/:subagora_name/subscribe', flexAuth, subagoraController.subscribe);
router.delete('/:subagora_name/subscribe', flexAuth, subagoraController.unsubscribe);

// Moderator add/remove: owner only
router.post('/:subagora_name/moderators', ownerModeratorAuth, subagoraController.moderatorBodyValidators, subagoraController.addModerator);
router.delete('/:subagora_name/moderators', ownerModeratorAuth, subagoraController.moderatorBodyValidators, subagoraController.removeModerator);

// SubAgora feed
router.get('/:subagora_name/feed', flexAuth, feedController.getSubAgoraFeed);

module.exports = router;
