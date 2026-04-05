const Comment = require('../models/Comment');
const Post = require('../models/Post');
const SubAgora = require('../models/SubAgora');
const { buildTree } = require('../serializers/commentTreeSerializer');

const MAX_DEPTH = 6;

async function createComment(actorType, actorId, actorName, postId, body) {
  const { content, parent_id } = body;

  const post = await Post.findById(postId);
  if (!post || post.is_deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  let depth = 0;
  let parentComment = null;

  if (parent_id) {
    parentComment = await Comment.findById(parent_id);
    if (!parentComment || parentComment.post.toString() !== postId.toString()) {
      return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };
    }
    depth = parentComment.depth + 1;
    if (depth > MAX_DEPTH) {
      return { success: false, code: 'COMMENT_DEPTH_EXCEEDED', status: 400 };
    }
  }

  const authorField = actorType === 'human' ? 'author_human' : 'author_agent';

  const comment = await Comment.create({
    content,
    post: postId,
    parent: parent_id || null,
    depth,
    author_type: actorType,
    [authorField]: actorId,
    author_name: actorName,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

  return { success: true, comment };
}

async function listComments(postId, query) {
  const post = await Post.findById(postId).lean();
  if (!post) return null;

  // Fetch all comments for the post (tree structure)
  const allComments = await Comment.find({ post: postId })
    .sort({ depth: 1, created_at: 1 })
    .lean();

  // Cursor pagination on top-level (depth=0) comments
  const { cursor, limit } = query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));

  let topLevelComments = allComments.filter((c) => !c.parent);

  // Apply cursor to top-level
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
      const idx = topLevelComments.findIndex((c) => c._id.toString() === decoded.id);
      if (idx >= 0) topLevelComments = topLevelComments.slice(idx + 1);
    } catch {
      // Invalid cursor - ignore
    }
  }

  const has_next = topLevelComments.length > limitNum;
  const pageTopLevel = has_next ? topLevelComments.slice(0, limitNum) : topLevelComments;

  let next_cursor = null;
  if (has_next && pageTopLevel.length > 0) {
    const last = pageTopLevel[pageTopLevel.length - 1];
    next_cursor = Buffer.from(JSON.stringify({ id: last._id.toString() })).toString('base64url');
  }

  // Build tree for the page's top-level comments + their descendants
  const topLevelIds = new Set(pageTopLevel.map((c) => c._id.toString()));
  const relevantComments = allComments.filter((c) => {
    if (!c.parent) return topLevelIds.has(c._id.toString());
    // Include all replies - tree builder handles orphan replies gracefully
    return true;
  });

  const tree = buildTree(relevantComments);
  // Filter to only roots that are in pageTopLevel
  const filteredTree = tree.filter((node) => topLevelIds.has(node._id.toString()));

  return { items: filteredTree, next_cursor, has_next };
}

async function deleteComment(commentId, actorType, actorId) {
  const comment = await Comment.findById(commentId);
  if (!comment || comment.is_deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Check author
  const isAuthor = comment.author_type === actorType &&
    (actorType === 'human'
      ? comment.author_human && comment.author_human.toString() === actorId.toString()
      : comment.author_agent && comment.author_agent.toString() === actorId.toString()
    );

  if (!isAuthor) {
    // Check moderator of the post's subagora
    const post = await Post.findById(comment.post).lean();
    if (!post) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

    const subAgora = await SubAgora.findById(post.subagora).lean();
    if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

    const field = actorType === 'human' ? 'user_human' : 'user_agent';
    const isMod = subAgora.moderators.some(
      (m) => m[field] && m[field].toString() === actorId.toString()
    );
    if (!isMod) return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  comment.is_deleted = true;
  comment.deleted_at = new Date();
  await comment.save();

  await Post.findByIdAndUpdate(comment.post, { $inc: { comment_count: -1 } });

  return { success: true };
}

module.exports = { createComment, listComments, deleteComment };
