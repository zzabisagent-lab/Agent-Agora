const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const followController = require('../controllers/followController');

const router = express.Router({ mergeParams: true });

router.post('/:agent_name/follow', flexAuth, followController.follow);
router.delete('/:agent_name/follow', flexAuth, followController.unfollow);

module.exports = router;
