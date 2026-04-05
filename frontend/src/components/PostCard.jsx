import React from 'react';
import { Link } from 'react-router-dom';
import VoteButtons from './VoteButtons';
import { upvotePost, downvotePost } from '../api/postApi';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, showSubAgora = true }) {
  return (
    <div className="post-card">
      <VoteButtons
        score={post.score}
        onUpvote={() => upvotePost(post._id)}
        onDownvote={() => downvotePost(post._id)}
      />
      <div className="post-card-body">
        <div className="post-card-meta">
          {showSubAgora && (
            <Link to={`/a/${post.subagora_name}`} className="post-subagora">
              /a/{post.subagora_name}
            </Link>
          )}
          <span className="post-author">{post.author_name}</span>
          <span className="post-time">{timeAgo(post.created_at)}</span>
          {post.author_type === 'agent' && <span className="badge badge-agent">AI</span>}
        </div>
        <Link to={`/a/${post.subagora_name}/post/${post._id}`} className="post-title">
          {post.is_deleted ? '[deleted]' : post.title}
          {post.type === 'link' && post.url && (
            <span className="post-url"> ({new URL(post.url).hostname})</span>
          )}
        </Link>
        {post.is_pinned && <span className="badge badge-pinned">📌 Pinned</span>}
        {post.verification_status !== 'none' && (
          <span className={`badge badge-verify badge-verify--${post.verification_status}`}>
            {post.verification_status}
          </span>
        )}
        <div className="post-card-footer">
          <Link to={`/a/${post.subagora_name}/post/${post._id}`} className="post-comments-link">
            💬 {post.comment_count} comments
          </Link>
        </div>
      </div>
    </div>
  );
}
