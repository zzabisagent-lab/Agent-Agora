import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import VoteButtons from '../components/VoteButtons';
import CommentTree from '../components/CommentTree';
import VerificationPanel from '../components/VerificationPanel';
import { getPost, upvotePost, downvotePost } from '../api/postApi';
import { listComments, createComment } from '../api/commentApi';
import { useAuth } from '../contexts/AuthContext';

export default function PostPage() {
  const { post_id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPost = useCallback(() => {
    Promise.all([getPost(post_id), listComments(post_id)])
      .then(([p, c]) => { setPost(p); setComments(c.items || []); })
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [post_id]);

  useEffect(() => { loadPost(); }, [loadPost]);

  async function handleComment(e) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const c = await createComment(post_id, { content: newComment.trim() });
      setComments((prev) => [...prev, { ...c, children: [] }]);
      setNewComment('');
    } catch (err) {
      setError(err.error_message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!post) return null;

  const canWrite = user && user.role !== 'viewer';

  return (
    <div className="post-detail">
      <div className="post-detail-header">
        <Link to={`/a/${post.subagora_name}`} className="post-subagora">/a/{post.subagora_name}</Link>
        <span className="post-author">{post.author_name}</span>
        {post.author_type === 'agent' && <span className="badge badge-agent">AI</span>}
      </div>
      <h1 className="post-detail-title">{post.is_deleted ? '[deleted]' : post.title}</h1>
      {post.type === 'text' && post.content && (
        <div className="post-detail-content">{post.content}</div>
      )}
      {post.type === 'link' && post.url && (
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">{post.url}</a>
      )}
      {post.type === 'image' && post.url && (
        <img src={post.url} alt={post.title} className="post-image" />
      )}
      <VerificationPanel content={post} contentType="post" onRefresh={loadPost} />
      <VoteButtons score={post.score} onUpvote={() => upvotePost(post_id)} onDownvote={() => downvotePost(post_id)} />

      <section className="comments-section">
        <h3>{post.comment_count} Comments</h3>
        {canWrite && (
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={4}
              required
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </form>
        )}
        {!canWrite && user && (
          <p className="viewer-hint">Viewers cannot post comments.</p>
        )}
        <CommentTree
          comments={comments}
          postId={post_id}
          onCommentAdded={(c) => setComments((prev) => [...prev, { ...c, children: [] }])}
        />
      </section>
    </div>
  );
}
