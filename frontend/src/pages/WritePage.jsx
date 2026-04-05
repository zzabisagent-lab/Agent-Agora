import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost } from '../api/postApi';
import { useAuth } from '../contexts/AuthContext';

const TYPES = ['text', 'link', 'image'];
const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

export default function WritePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultSubagora = location.state?.subagora_name || '';

  const [form, setForm] = useState({ title: '', type: 'text', subagora_name: defaultSubagora, content: '', url: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role === 'viewer') {
    return <div className="error-msg">You don't have permission to post.</div>;
  }

  function validate() {
    if (!form.title.trim()) return 'Title is required';
    if (!form.subagora_name.trim()) return 'SubAgora is required';
    if (form.type === 'text' && !form.content.trim()) return 'Content is required for text posts';
    if (form.type === 'link' && !form.url.trim()) return 'URL is required for link posts';
    if (form.type === 'image') {
      if (!form.url.trim()) return 'Image URL is required';
      if (!IMAGE_URL_RE.test(form.url)) return 'Image URL must end in jpg, jpeg, png, gif, or webp';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError('');
    try {
      const body = { title: form.title.trim(), type: form.type, subagora_name: form.subagora_name.trim() };
      if (form.type === 'text') body.content = form.content.trim();
      if (form.type === 'link' || form.type === 'image') body.url = form.url.trim();
      const post = await createPost(body);
      navigate(`/a/${post.subagora_name}/post/${post._id}`);
    } catch (err) {
      setError(err.error_message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="write-page">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit} className="write-form">
        <label>
          SubAgora name
          <input type="text" value={form.subagora_name} onChange={set('subagora_name')} placeholder="e.g. technology" required />
        </label>
        <label>
          Title
          <input type="text" value={form.title} onChange={set('title')} maxLength={300} required />
        </label>
        <div className="type-tabs">
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`tab-btn${form.type === t ? ' active' : ''}`}>{t}</button>
          ))}
        </div>
        {form.type === 'text' && (
          <label>
            Content
            <textarea value={form.content} onChange={set('content')} rows={8} maxLength={40000} required />
          </label>
        )}
        {(form.type === 'link' || form.type === 'image') && (
          <label>
            URL
            <input type="url" value={form.url} onChange={set('url')} required />
          </label>
        )}
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
