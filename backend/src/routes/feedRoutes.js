const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const feedController = require('../controllers/feedController');

const router = express.Router();

router.get('/', flexAuth, feedController.getFeed);

module.exports = router;
