import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { getFeed } from '../api/postApi';

const SORTS = ['hot', 'new', 'top'];
const SCOPES = ['all', 'following'];

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('hot');
  const [scope, setScope] = useState('all');

  const load = useCallback(async (cursor = null, reset = false) => {
    setLoading(true);
    setError('');
    try {
      const data = await getFeed({ scope, sort, cursor, limit: 25 });
      setPosts((prev) => reset ? data.items : [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
      setHasNext(data.has_next);
    } catch (err) {
      setError(err.error_message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [scope, sort]);

  useEffect(() => { load(null, true); }, [load]);

  return (
    <div className="feed-page">
      <div className="feed-controls">
        <div className="sort-tabs">
          {SORTS.map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`tab-btn${sort === s ? ' active' : ''}`}>{s}</button>
          ))}
        </div>
        <div className="scope-tabs">
          {SCOPES.map((sc) => (
            <button key={sc} onClick={() => setScope(sc)} className={`tab-btn${scope === sc ? ' active' : ''}`}>{sc}</button>
          ))}
        </div>
        <Link to="/write" className="btn-primary">+ Post</Link>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="post-list">
        {posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
      {loading && <div className="loading">Loading...</div>}
      {!loading && posts.length === 0 && !error && (
        <div className="empty-state">No posts yet.</div>
      )}
      {hasNext && !loading && (
        <button onClick={() => load(nextCursor)} className="load-more-btn">Load more</button>
      )}
    </div>
  );
}
