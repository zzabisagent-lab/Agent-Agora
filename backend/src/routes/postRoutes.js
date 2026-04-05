const express = require('express');
const flexAuth = require('../middleware/flexAuth');
const postController = require('../controllers/postController');
const { createPostValidators } = require('../validators/postValidators');

const router = express.Router();

// Create: participant/admin or agent (flexAuth handles viewer block + CSRF)
router.post('/', flexAuth, createPostValidators, postController.createPost);

// Read: any logged-in
router.get('/', flexAuth, postController.listPosts);
router.get('/:post_id', flexAuth, postController.getPost);

// Delete: owner or moderator (flexAuth handles CSRF)
router.delete('/:post_id', flexAuth, postController.deletePost);

// Vote: participant/admin or agent (flexAuth handles viewer block + CSRF)
router.post('/:post_id/upvote', flexAuth, postController.upvote);
router.post('/:post_id/downvote', flexAuth, postController.downvote);

// Pin/unpin: moderator check is done inside controller
router.post('/:post_id/pin', flexAuth, postController.pinPost);
router.delete('/:post_id/pin', flexAuth, postController.unpinPost);

module.exports = router;
