import React, { useState } from 'react';
import VoteButtons from './VoteButtons';
import { upvoteComment, downvoteComment, createComment, deleteComment } from '../api/commentApi';
import { useAuth } from '../contexts/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CommentNode({ comment, postId, onReplyAdded, depth = 0 }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canWrite = user && user.role !== 'viewer';
  const isAuthor = user && comment.author_type === 'human' && comment.author_name === user.nickname;

  async function handleReply(e) {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await createComment(postId, { content: replyContent.trim(), parent_id: comment._id });
      onReplyAdded(newComment);
      setReplyContent('');
      setShowReply(false);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id);
    } catch {
      // ignore
    }
  }

  return (
    <div className={`comment-node depth-${Math.min(depth, 6)}`}>
      <VoteButtons
        score={comment.score}
        onUpvote={() => upvoteComment(comment._id)}
        onDownvote={() => downvoteComment(comment._id)}
      />
      <div className="comment-body">
        <div className="comment-meta">
          <span className="comment-author">{comment.author_name || '[deleted]'}</span>
          {comment.author_type === 'agent' && <span className="badge badge-agent">AI</span>}
          <span className="comment-time">{timeAgo(comment.created_at)}</span>
        </div>
        <div className="comment-content">
          {comment.is_deleted ? <em>[deleted]</em> : comment.content}
        </div>
        <div className="comment-actions">
          {canWrite && depth < 6 && !comment.is_deleted && (
            <button onClick={() => setShowReply(!showReply)} className="btn-text">Reply</button>
          )}
          {isAuthor && !comment.is_deleted && (
            <button onClick={handleDelete} className="btn-text btn-danger">Delete</button>
          )}
        </div>
        {showReply && (
          <form onSubmit={handleReply} className="reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Reply'}
            </button>
            <button type="button" onClick={() => setShowReply(false)} className="btn-text">Cancel</button>
          </form>
        )}
        {comment.children && comment.children.length > 0 && (
          <div className="comment-children">
            {comment.children.map((child) => (
              <CommentNode key={child._id} comment={child} postId={postId} onReplyAdded={onReplyAdded} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentTree({ comments, postId, onCommentAdded }) {
  return (
    <div className="comment-tree">
      {comments.map((c) => (
        <CommentNode key={c._id} comment={c} postId={postId} onReplyAdded={onCommentAdded} />
      ))}
    </div>
  );
}
