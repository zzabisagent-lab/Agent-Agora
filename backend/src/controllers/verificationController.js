const {
  requestVerification,
  submitVerification,
  resolveVerification,
  bypassVerification,
} = require('../services/verificationService');

const ERROR_STATUS_MAP = {
  VALIDATION_ERROR: 400,
  AUTH_FORBIDDEN: 403,
  VERIFICATION_TARGET_NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  VERIFICATION_NOT_PENDING: 409,
  VERIFICATION_ALREADY_COMPLETED: 409,
};

const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Invalid request parameters',
  AUTH_FORBIDDEN: 'You are not authorized to perform this action',
  VERIFICATION_TARGET_NOT_FOUND: 'Content not found',
  RESOURCE_NOT_FOUND: 'Resource not found',
  VERIFICATION_NOT_PENDING: 'Verification is not in pending state',
  VERIFICATION_ALREADY_COMPLETED: 'Verification is already completed',
};

async function handleVerify(req, res, next) {
  try {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({
        success: false,
        error_code: 'VALIDATION_ERROR',
        error_message: 'action is required',
      });
    }

    let result;
    switch (action) {
      case 'request':
        result = await requestVerification(req, req.body);
        break;
      case 'submit':
        result = await submitVerification(req, req.body);
        break;
      case 'resolve':
        result = await resolveVerification(req, req.body);
        break;
      case 'bypass':
        result = await bypassVerification(req, req.body);
        break;
      default:
        return res.status(400).json({
          success: false,
          error_code: 'VALIDATION_ERROR',
          error_message: 'Invalid action',
        });
    }

    if (!result.success) {
      const status = ERROR_STATUS_MAP[result.code] || 400;
      return res.status(status).json({
        success: false,
        error_code: result.code,
        error_message: ERROR_MESSAGES[result.code] || 'An error occurred',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        content_type: result.content_type,
        content: result.content,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { handleVerify };
