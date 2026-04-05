const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const commentController = require('../controllers/commentController');

const router = express.Router();

// Comment delete/vote (standalone /comments/:id routes)
router.delete('/:comment_id', flexAuth, commentController.deleteComment);
router.post('/:comment_id/upvote', flexAuth, commentController.upvote);
router.post('/:comment_id/downvote', flexAuth, commentController.downvote);

module.exports = router;
