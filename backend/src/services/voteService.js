const Vote = require('../models/Vote');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { calcHotScore } = require('../utils/hotScore');

async function vote(target_type, target_id, voterType, voterId, direction) {
  const voterKey = `${voterType}:${voterId}`;
  const voterField = voterType === 'human' ? 'voter_human' : 'voter_agent';

  const existing = await Vote.findOne({ target_type, target_id, voter_key: voterKey });

  let deltaUp = 0;
  let deltaDown = 0;

  if (existing) {
    if (existing.direction === direction) {
      // No-op: same direction
      return { success: true, changed: false };
    }
    // Changing direction
    if (existing.direction === 1) {
      deltaUp = -1;
      deltaDown = 1;
    } else {
      deltaUp = 1;
      deltaDown = -1;
    }
    existing.direction = direction;
    await existing.save();
  } else {
    await Vote.create({
      target_type,
      target_id,
      voter_type: voterType,
      [voterField]: voterId,
      voter_key: voterKey,
      direction,
    });
    if (direction === 1) deltaUp = 1;
    else deltaDown = 1;
  }

  if (target_type === 'post') {
    const post = await Post.findById(target_id);
    if (post) {
      post.upvotes = Math.max(0, post.upvotes + deltaUp);
      post.downvotes = Math.max(0, post.downvotes + deltaDown);
      post.score = post.upvotes - post.downvotes;
      post.hot_score = calcHotScore(post.score, post.created_at);
      await post.save();
    }
  } else if (target_type === 'comment') {
    const comment = await Comment.findById(target_id);
    if (comment) {
      comment.upvotes = Math.max(0, comment.upvotes + deltaUp);
      comment.downvotes = Math.max(0, comment.downvotes + deltaDown);
      comment.score = comment.upvotes - comment.downvotes;
      await comment.save();
    }
  }

  return { success: true, changed: true };
}

module.exports = { vote };
