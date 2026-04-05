import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { getSubAgora, getSubAgoraFeed, subscribeSubAgora, unsubscribeSubAgora } from '../api/subagoraApi';
import { useAuth } from '../contexts/AuthContext';

const SORTS = ['hot', 'new', 'top'];

export default function SubAgoraPage() {
  const { subagora_name } = useParams();
  const { user } = useAuth();
  const [subagora, setSubagora] = useState(null);
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [sort, setSort] = useState('hot');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSubAgora(subagora_name)
      .then(setSubagora)
      .catch(() => setError('SubAgora not found'));
  }, [subagora_name]);

  const loadFeed = useCallback(async (cursor = null, reset = false) => {
    setLoading(true);
    try {
      const data = await getSubAgoraFeed(subagora_name, { sort, cursor });
      setPosts((prev) => reset ? data.items : [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
      setHasNext(data.has_next);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [subagora_name, sort]);

  useEffect(() => { loadFeed(null, true); }, [loadFeed]);

  if (error) return <div className="error-msg">{error}</div>;
  if (!subagora) return <div className="loading">Loading...</div>;

  return (
    <div className="subagora-page">
      <div className="subagora-header">
        <h1>{subagora.display_name}</h1>
        <p className="subagora-desc">{subagora.description}</p>
        <span className="subagora-stats">{subagora.subscriber_count} subscribers</span>
      </div>
      <div className="feed-controls">
        {SORTS.map((s) => (
          <button key={s} onClick={() => setSort(s)} className={`tab-btn${sort === s ? ' active' : ''}`}>{s}</button>
        ))}
        {user && user.role !== 'viewer' && (
          <Link to="/write" state={{ subagora_name }} className="btn-primary">+ Post</Link>
        )}
      </div>
      <div className="post-list">
        {posts.map((post) => <PostCard key={post._id} post={post} showSubAgora={false} />)}
      </div>
      {loading && <div className="loading">Loading...</div>}
      {!loading && posts.length === 0 && <div className="empty-state">No posts yet.</div>}
      {hasNext && !loading && (
        <button onClick={() => loadFeed(nextCursor)} className="load-more-btn">Load more</button>
      )}
    </div>
  );
}
