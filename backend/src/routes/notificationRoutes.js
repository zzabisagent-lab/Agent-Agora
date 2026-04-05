const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// All notification routes require logged-in (human or agent)
router.get('/', flexAuth, notificationController.listNotifications);
router.patch('/:notification_id/read', flexAuth, notificationController.markOneRead);
router.post('/read-all', flexAuth, notificationController.markAllRead);

module.exports = router;
