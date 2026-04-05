const { validationResult } = require('express-validator');
const postService = require('../services/postService');
const voteService = require('../services/voteService');
const SubAgora = require('../models/SubAgora');

const ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Post or subagora not found',
  AUTH_FORBIDDEN: 'Access denied',
  PIN_LIMIT_EXCEEDED: 'Cannot pin more than 3 posts',
  CONFLICT: 'No change',
};

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error_code: 'VALIDATION_FAILED',
      error_message: 'One or more fields are invalid',
      details: { fields: Object.fromEntries(errors.array().map((e) => [e.path, e.msg])) },
    });
    return false;
  }
  return true;
}

function handleServiceError(res, result) {
  const httpMap = {
    RESOURCE_NOT_FOUND: 404,
    AUTH_FORBIDDEN: 403,
    PIN_LIMIT_EXCEEDED: 409,
    CONFLICT: 409,
  };
  return res.status(result.status || httpMap[result.code] || 400).json({
    success: false,
    error_code: result.code,
    error_message: ERROR_MESSAGES[result.code] || 'Request failed',
  });
}

function getActor(req) {
  if (req.actorType === 'agent') {
    return { actorType: 'agent', actorId: req.agent._id, actorName: req.agent.name };
  }
  return { actorType: 'human', actorId: req.user._id, actorName: req.user.nickname };
}

async function createPost(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const { actorType, actorId, actorName } = getActor(req);
    const result = await postService.createPost(actorType, actorId, actorName, req.body);
    if (!result.success) return handleServiceError(res, result);
    return res.status(201).json({ success: true, data: { post: result.post } });
  } catch (err) {
    next(err);
  }
}

async function listPosts(req, res, next) {
  try {
    const data = await postService.listPosts(req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await postService.getPost(req.params.post_id);
    if (!post) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Post not found' });
    return res.status(200).json({ success: true, data: { post } });
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await postService.deletePost(req.params.post_id, actorType, actorId);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

async function upvote(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await voteService.vote('post', req.params.post_id, actorType, actorId, 1);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { changed: result.changed } });
  } catch (err) {
    next(err);
  }
}

async function downvote(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await voteService.vote('post', req.params.post_id, actorType, actorId, -1);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { changed: result.changed } });
  } catch (err) {
    next(err);
  }
}

// Pin requires moderator of the post's subagora
async function pinPost(req, res, next) {
  try {
    const post = await require('../models/Post').findById(req.params.post_id).lean();
    if (!post || post.is_deleted) {
      return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Post not found' });
    }

    // Check moderator
    const { actorType, actorId } = getActor(req);
    const subAgora = await SubAgora.findById(post.subagora).lean();
    if (!subAgora) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'SubAgora not found' });

    const field = actorType === 'human' ? 'user_human' : 'user_agent';
    const isMod = subAgora.moderators.some((m) => m[field] && m[field].toString() === actorId.toString());
    if (!isMod) return res.status(403).json({ success: false, error_code: 'AUTH_FORBIDDEN', error_message: 'Moderator access required' });

    const result = await postService.pinPost(req.params.post_id, subAgora.name);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { post: result.post } });
  } catch (err) {
    next(err);
  }
}

async function unpinPost(req, res, next) {
  try {
    const post = await require('../models/Post').findById(req.params.post_id).lean();
    if (!post || post.is_deleted) {
      return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Post not found' });
    }

    const { actorType, actorId } = getActor(req);
    const subAgora = await SubAgora.findById(post.subagora).lean();
    if (!subAgora) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'SubAgora not found' });

    const field = actorType === 'human' ? 'user_human' : 'user_agent';
    const isMod = subAgora.moderators.some((m) => m[field] && m[field].toString() === actorId.toString());
    if (!isMod) return res.status(403).json({ success: false, error_code: 'AUTH_FORBIDDEN', error_message: 'Moderator access required' });

    const result = await postService.unpinPost(req.params.post_id, subAgora.name);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { post: result.post } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPost,
  listPosts,
  getPost,
  deletePost,
  upvote,
  downvote,
  pinPost,
  unpinPost,
};
