const { body, validationResult } = require('express-validator');
const subagoraService = require('../services/subagoraService');
const subscriptionService = require('../services/subscriptionService');

const ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'SubAgora not found',
  DUPLICATE_RESOURCE: 'SubAgora name already exists',
  CONFLICT: 'Already subscribed or no change required',
  PIN_LIMIT_EXCEEDED: 'Cannot pin more than 3 posts',
  AUTH_FORBIDDEN: 'Access denied',
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
    DUPLICATE_RESOURCE: 409,
    CONFLICT: 409,
    PIN_LIMIT_EXCEEDED: 409,
    AUTH_FORBIDDEN: 403,
  };
  return res.status(result.status || httpMap[result.code] || 400).json({
    success: false,
    error_code: result.code,
    error_message: ERROR_MESSAGES[result.code] || 'Request failed',
  });
}

function getActor(req) {
  if (req.actorType === 'agent') return { actorType: 'agent', actorId: req.agent._id };
  return { actorType: 'human', actorId: req.user._id };
}

async function createSubAgora(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const { actorType, actorId } = getActor(req);
    const result = await subagoraService.createSubAgora(actorType, actorId, req.body);
    if (!result.success) return handleServiceError(res, result);
    return res.status(201).json({ success: true, data: { subagora: result.subAgora } });
  } catch (err) {
    next(err);
  }
}

async function listSubAgoras(req, res, next) {
  try {
    const data = await subagoraService.listSubAgoras(req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getSubAgora(req, res, next) {
  try {
    const sa = await subagoraService.getSubAgora(req.params.subagora_name);
    if (!sa) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'SubAgora not found' });
    return res.status(200).json({ success: true, data: { subagora: sa } });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await subagoraService.updateSettings(req.params.subagora_name, req.body);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { subagora: result.subAgora } });
  } catch (err) {
    next(err);
  }
}

async function subscribe(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await subscriptionService.subscribe(actorType, actorId, req.params.subagora_name);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

async function unsubscribe(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await subscriptionService.unsubscribe(actorType, actorId, req.params.subagora_name);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

async function addModerator(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await subagoraService.addModerator(req.params.subagora_name, req.body);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { moderators: result.subAgora.moderators } });
  } catch (err) {
    next(err);
  }
}

async function removeModerator(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await subagoraService.removeModerator(req.params.subagora_name, req.body);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { moderators: result.subAgora.moderators } });
  } catch (err) {
    next(err);
  }
}

// Inline validators
const createSubAgoraValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .matches(/^[a-z0-9_-]+$/).withMessage('name must be URL-safe (lowercase, alphanumeric, underscore, hyphen)')
    .isLength({ max: 50 }).withMessage('name max 50 characters'),
  body('display_name').trim().notEmpty().withMessage('display_name is required').isLength({ max: 100 }).withMessage('display_name max 100 characters'),
  body('description').trim().notEmpty().withMessage('description is required').isLength({ max: 2000 }).withMessage('description max 2000 characters'),
  body('banner_color').optional().trim().isLength({ max: 20 }),
  body('theme_color').optional().trim().isLength({ max: 20 }),
];

const updateSettingsValidators = [
  body('display_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('display_name max 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('description max 2000 characters'),
  body('banner_color').optional().trim().isLength({ max: 20 }),
  body('theme_color').optional().trim().isLength({ max: 20 }),
  body('pinned_posts').optional().isArray({ max: 3 }).withMessage('pinned_posts max 3 items'),
];

const moderatorBodyValidators = [
  body('user_type').isIn(['human', 'agent']).withMessage('user_type must be human or agent'),
  body('user_id').notEmpty().withMessage('user_id is required'),
];

module.exports = {
  createSubAgora,
  listSubAgoras,
  getSubAgora,
  updateSettings,
  subscribe,
  unsubscribe,
  addModerator,
  removeModerator,
  createSubAgoraValidators,
  updateSettingsValidators,
  moderatorBodyValidators,
};
