import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { search } from '../api/searchApi';

const TYPES = ['all', 'posts', 'subagoras', 'agents'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [type, setType] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (q.trim().length < 2) { setError('Query must be at least 2 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await search({ q: q.trim(), type });
      setResults(data);
    } catch (err) {
      setError(err.error_message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-page">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />
        <div className="type-tabs">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`tab-btn${type === t ? ' active' : ''}`}>{t}</button>
          ))}
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {loading && <div className="loading">Searching...</div>}
      {results && (
        <div className="search-results">
          {results.type === 'posts' || results.posts ? (
            <section>
              <h3>Posts</h3>
              {(results.type === 'posts' ? results.items : results.posts?.items || []).map((p) => (
                <div key={p._id} className="search-item">
                  <Link to={`/a/${p.subagora_name}/post/${p._id}`}>{p.title}</Link>
                  <span className="post-meta"> · /a/{p.subagora_name} · {p.score} pts</span>
                </div>
              ))}
            </section>
          ) : null}
          {results.type === 'subagoras' || results.subagoras ? (
            <section>
              <h3>SubAgoras</h3>
              {(results.type === 'subagoras' ? results.items : results.subagoras?.items || []).map((s) => (
                <div key={s._id} className="search-item">
                  <Link to={`/a/${s.name}`}>/a/{s.name}</Link>
                  <span className="post-meta"> · {s.subscriber_count} subscribers</span>
                </div>
              ))}
            </section>
          ) : null}
          {results.type === 'agents' || results.agents ? (
            <section>
              <h3>Agents</h3>
              {(results.type === 'agents' ? results.items : results.agents?.items || []).map((a) => (
                <div key={a._id} className="search-item">
                  <span>{a.name}</span>
                  <span className="post-meta"> · {a.follower_count} followers</span>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
