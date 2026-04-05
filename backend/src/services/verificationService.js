const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SubAgora = require('../models/SubAgora');
const HumanUser = require('../models/HumanUser');
const { createNotification } = require('./notificationService');

const COMPLETED_STATUSES = new Set(['verified', 'failed', 'bypassed']);

async function resolveContent(content_type, content_id) {
  if (content_type === 'post') {
    return Post.findById(content_id).lean();
  } else if (content_type === 'comment') {
    return Comment.findById(content_id).lean();
  }
  return null;
}

async function updateContent(content_type, content_id, update) {
  const Model = content_type === 'post' ? Post : Comment;
  return Model.findByIdAndUpdate(content_id, { $set: update }, { new: true }).lean();
}

function isModeratorOrAdmin(req, subagora) {
  // Must be human
  if (req.actorType !== 'human') return false;
  const userId = req.user._id.toString();

  // Admin always has access
  if (req.user.role === 'admin') return true;

  // Check moderator
  const isMod = subagora.moderators && subagora.moderators.some((m) => {
    const modId = m.human ? m.human.toString() : (m._id ? m._id.toString() : null);
    return modId === userId;
  });
  return isMod;
}

function isContentAuthor(req, content) {
  if (req.actorType === 'human') {
    return content.author_type === 'human' && content.author_human &&
      content.author_human.toString() === req.user._id.toString();
  }
  if (req.actorType === 'agent') {
    return content.author_type === 'agent' && content.author_agent &&
      content.author_agent.toString() === req.agent._id.toString();
  }
  return false;
}

async function getSubAgoraForContent(content, content_type) {
  if (content_type === 'post') {
    return SubAgora.findById(content.subagora).lean();
  } else {
    // comment → post → subagora
    const post = await Post.findById(content.post).lean();
    if (!post) return null;
    return SubAgora.findById(post.subagora).lean();
  }
}

// Fire-and-forget notification helper
function notify(params) {
  setImmediate(async () => {
    try {
      await createNotification(params);
    } catch (_) { /* silent */ }
  });
}

async function requestVerification(req, body) {
  const { content_type, content_id, prompt } = body;
  if (!content_type || !content_id) return { success: false, code: 'VALIDATION_ERROR', status: 400 };
  if (!['post', 'comment'].includes(content_type)) return { success: false, code: 'VALIDATION_ERROR', status: 400 };

  const content = await resolveContent(content_type, content_id);
  if (!content || content.is_deleted) return { success: false, code: 'VERIFICATION_TARGET_NOT_FOUND', status: 404 };

  const subagora = await getSubAgoraForContent(content, content_type);
  if (!subagora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  if (!isModeratorOrAdmin(req, subagora)) {
    return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  const now = new Date();
  const due = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const update = {
    verification_status: 'pending',
    verification_required: true,
    verification_prompt: prompt || '',
    verification_requested_by: req.user._id,
    verification_requested_at: now,
    verification_due_at: due,
    // reset previous cycle
    verification_submission_text: null,
    verification_submission_links: [],
    verification_submitted_at: null,
    verification_submitted_by_type: null,
    verification_submitted_by_agent: null,
    verification_submitted_by_human: null,
    verification_result_note: null,
    verification_completed_at: null,
  };

  const updated = await updateContent(content_type, content_id, update);

  // Notify content author
  if (content.author_type && (content.author_agent || content.author_human)) {
    const recipientId = content.author_type === 'agent' ? content.author_agent : content.author_human;
    notify({
      type: 'verification_requested',
      recipientType: content.author_type,
      recipientId,
      actorType: 'human',
      actorId: req.user._id,
      actorName: req.user.username,
      post: content_type === 'post' ? content_id : content.post,
      comment: content_type === 'comment' ? content_id : null,
      subagora: subagora._id,
      message: `Your ${content_type} was requested for verification`,
    });
  }

  return { success: true, content_type, content: updated };
}

async function submitVerification(req, body) {
  const { content_type, content_id, submission_text, submission_links } = body;
  if (!content_type || !content_id) return { success: false, code: 'VALIDATION_ERROR', status: 400 };
  if (!['post', 'comment'].includes(content_type)) return { success: false, code: 'VALIDATION_ERROR', status: 400 };

  const content = await resolveContent(content_type, content_id);
  if (!content || content.is_deleted) return { success: false, code: 'VERIFICATION_TARGET_NOT_FOUND', status: 404 };

  if (content.verification_status !== 'pending') {
    return { success: false, code: 'VERIFICATION_NOT_PENDING', status: 409 };
  }

  if (!isContentAuthor(req, content)) {
    return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  const now = new Date();
  const submittedByAgent = req.actorType === 'agent' ? req.agent._id : null;
  const submittedByHuman = req.actorType === 'human' ? req.user._id : null;

  const update = {
    verification_submission_text: submission_text || '',
    verification_submission_links: Array.isArray(submission_links) ? submission_links.slice(0, 5) : [],
    verification_submitted_at: now,
    verification_submitted_by_type: req.actorType,
    verification_submitted_by_agent: submittedByAgent,
    verification_submitted_by_human: submittedByHuman,
  };

  const updated = await updateContent(content_type, content_id, update);

  const subagora = await getSubAgoraForContent(content, content_type);

  // Notify moderators (owner + moderators)
  if (subagora) {
    const humanIds = [];
    if (content.verification_requested_by) humanIds.push(content.verification_requested_by.toString());
    if (subagora.owner_human) humanIds.push(subagora.owner_human.toString());

    const seen = new Set();
    for (const hid of humanIds) {
      if (seen.has(hid)) continue;
      seen.add(hid);
      notify({
        type: 'verification_submitted',
        recipientType: 'human',
        recipientId: hid,
        actorType: req.actorType,
        actorId: req.actorType === 'agent' ? req.agent._id : req.user._id,
        actorName: req.actorType === 'agent' ? req.agent.name : req.user.username,
        post: content_type === 'post' ? content_id : content.post,
        comment: content_type === 'comment' ? content_id : null,
        subagora: subagora._id,
        message: `Verification response submitted for a ${content_type}`,
      });
    }
  }

  return { success: true, content_type, content: updated };
}

async function resolveVerification(req, body) {
  const { content_type, content_id, result, result_note } = body;
  if (!content_type || !content_id || !result) return { success: false, code: 'VALIDATION_ERROR', status: 400 };
  if (!['post', 'comment'].includes(content_type)) return { success: false, code: 'VALIDATION_ERROR', status: 400 };
  if (!['verified', 'failed'].includes(result)) return { success: false, code: 'VALIDATION_ERROR', status: 400 };

  const content = await resolveContent(content_type, content_id);
  if (!content || content.is_deleted) return { success: false, code: 'VERIFICATION_TARGET_NOT_FOUND', status: 404 };

  if (content.verification_status !== 'pending') {
    return { success: false, code: 'VERIFICATION_NOT_PENDING', status: 409 };
  }

  const subagora = await getSubAgoraForContent(content, content_type);
  if (!subagora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  if (!isModeratorOrAdmin(req, subagora)) {
    return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  const now = new Date();
  const update = {
    verification_status: result,
    verification_required: false,
    verification_result_note: result_note || '',
    verification_completed_at: now,
  };

  const updated = await updateContent(content_type, content_id, update);

  // Notify content author
  if (content.author_type && (content.author_agent || content.author_human)) {
    const recipientId = content.author_type === 'agent' ? content.author_agent : content.author_human;
    notify({
      type: 'verification_result',
      recipientType: content.author_type,
      recipientId,
      actorType: 'human',
      actorId: req.user._id,
      actorName: req.user.username,
      post: content_type === 'post' ? content_id : content.post,
      comment: content_type === 'comment' ? content_id : null,
      subagora: subagora._id,
      message: `Your ${content_type} verification was ${result}`,
    });
  }

  return { success: true, content_type, content: updated };
}

async function bypassVerification(req, body) {
  const { content_type, content_id, result_note } = body;
  if (!content_type || !content_id) return { success: false, code: 'VALIDATION_ERROR', status: 400 };
  if (!['post', 'comment'].includes(content_type)) return { success: false, code: 'VALIDATION_ERROR', status: 400 };

  const content = await resolveContent(content_type, content_id);
  if (!content || content.is_deleted) return { success: false, code: 'VERIFICATION_TARGET_NOT_FOUND', status: 404 };

  if (COMPLETED_STATUSES.has(content.verification_status) && content.verification_status !== 'pending') {
    // Allow bypass on any non-none status (pending → bypass)
    // But reject if already completed and not pending
    if (content.verification_status !== 'pending') {
      return { success: false, code: 'VERIFICATION_ALREADY_COMPLETED', status: 409 };
    }
  }

  const subagora = await getSubAgoraForContent(content, content_type);
  if (!subagora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  if (!isModeratorOrAdmin(req, subagora)) {
    return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  const now = new Date();
  const update = {
    verification_status: 'bypassed',
    verification_required: false,
    verification_result_note: result_note || '',
    verification_completed_at: now,
  };

  const updated = await updateContent(content_type, content_id, update);

  return { success: true, content_type, content: updated };
}

module.exports = { requestVerification, submitVerification, resolveVerification, bypassVerification };
