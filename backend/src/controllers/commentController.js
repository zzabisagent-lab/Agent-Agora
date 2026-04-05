const { body, validationResult } = require('express-validator');
const commentService = require('../services/commentService');
const voteService = require('../services/voteService');

const ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Comment or post not found',
  AUTH_FORBIDDEN: 'Access denied',
  COMMENT_DEPTH_EXCEEDED: 'Maximum comment depth exceeded',
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
    COMMENT_DEPTH_EXCEEDED: 400,
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

const createCommentValidators = [
  body('content').trim().notEmpty().withMessage('content is required').isLength({ max: 10000 }).withMessage('content max 10000 characters'),
  body('parent_id').optional().isMongoId().withMessage('parent_id must be a valid ID'),
];

async function createComment(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const { actorType, actorId, actorName } = getActor(req);
    const result = await commentService.createComment(actorType, actorId, actorName, req.params.post_id, req.body);
    if (!result.success) return handleServiceError(res, result);
    return res.status(201).json({ success: true, data: { comment: result.comment } });
  } catch (err) {
    next(err);
  }
}

async function listComments(req, res, next) {
  try {
    const data = await commentService.listComments(req.params.post_id, req.query);
    if (!data) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Post not found' });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await commentService.deleteComment(req.params.comment_id, actorType, actorId);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

async function upvote(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await voteService.vote('comment', req.params.comment_id, actorType, actorId, 1);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { changed: result.changed } });
  } catch (err) {
    next(err);
  }
}

async function downvote(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await voteService.vote('comment', req.params.comment_id, actorType, actorId, -1);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { changed: result.changed } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createComment,
  listComments,
  deleteComment,
  upvote,
  downvote,
  createCommentValidators,
};
