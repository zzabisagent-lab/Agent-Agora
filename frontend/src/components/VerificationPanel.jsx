import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

const STATUS_LABELS = {
  none: null,
  pending: 'Verification Pending',
  verified: 'Verified',
  failed: 'Verification Failed',
  bypassed: 'Bypassed',
};

async function verifyAction(body) {
  const res = await client.post('/verify', body);
  return res.data;
}

export default function VerificationPanel({ content, contentType, onRefresh }) {
  const { user } = useAuth();
  const status = content?.verification_status || 'none';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Submit form state
  const [submitText, setSubmitText] = useState('');
  const [submitLinks, setSubmitLinks] = useState('');

  // Resolve/bypass form state
  const [resolveResult, setResolveResult] = useState('verified');
  const [resolveNote, setResolveNote] = useState('');

  // Request form state
  const [requestPrompt, setRequestPrompt] = useState('');

  if (status === 'none') return null;

  const isAuthor = user && content?.author_name === user.username;
  const isMod = user && (user.role === 'admin' || user.role === 'member');

  const run = async (action, extra = {}) => {
    setSubmitting(true);
    setError('');
    try {
      await verifyAction({ action, content_type: contentType, content_id: content._id, ...extra });
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err?.response?.data?.error_message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const links = submitLinks.split('\n').map((l) => l.trim()).filter(Boolean);
    run('submit', { submission_text: submitText, submission_links: links });
  };

  const handleResolve = (e) => {
    e.preventDefault();
    run('resolve', { result: resolveResult, result_note: resolveNote });
  };

  const handleBypass = () => {
    run('bypass', { result_note: resolveNote });
  };

  const handleRequest = (e) => {
    e.preventDefault();
    run('request', { prompt: requestPrompt });
  };

  return (
    <div className={`verification-panel verification-panel--${status}`}>
      <strong>{STATUS_LABELS[status]}</strong>
      {status === 'pending' && content?.verification_prompt && (
        <p className="verification-prompt">{content.verification_prompt}</p>
      )}

      {/* Author can submit */}
      {status === 'pending' && isAuthor && !content?.verification_submitted_at && (
        <form className="verification-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="Describe your response..."
            value={submitText}
            onChange={(e) => setSubmitText(e.target.value)}
            rows={3}
            required
          />
          <textarea
            placeholder="Supporting links (one per line, max 5)"
            value={submitLinks}
            onChange={(e) => setSubmitLinks(e.target.value)}
            rows={2}
          />
          <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      )}

      {status === 'pending' && isAuthor && content?.verification_submitted_at && (
        <p className="verification-hint">Response submitted. Awaiting moderator review.</p>
      )}

      {/* Moderator can resolve/bypass */}
      {status === 'pending' && isMod && (
        <form className="verification-form" onSubmit={handleResolve}>
          <div className="verify-resolve-row">
            <select value={resolveResult} onChange={(e) => setResolveResult(e.target.value)}>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
            </select>
            <input
              placeholder="Result note (optional)"
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
            />
          </div>
          <div className="verify-action-row">
            <button type="submit" className="btn-primary btn-sm" disabled={submitting}>Resolve</button>
            <button type="button" className="btn-secondary btn-sm" disabled={submitting} onClick={handleBypass}>Bypass</button>
          </div>
        </form>
      )}

      {/* Moderator can request new verification on completed content */}
      {['verified', 'failed', 'bypassed'].includes(status) && isMod && (
        <form className="verification-form" onSubmit={handleRequest}>
          <input
            placeholder="New verification prompt"
            value={requestPrompt}
            onChange={(e) => setRequestPrompt(e.target.value)}
            required
          />
          <button type="submit" className="btn-secondary btn-sm" disabled={submitting}>Re-request</button>
        </form>
      )}

      {/* Moderator can request verification on none status */}
      {status === 'none' && isMod && (
        <form className="verification-form" onSubmit={handleRequest}>
          <input
            placeholder="Verification prompt"
            value={requestPrompt}
            onChange={(e) => setRequestPrompt(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary btn-sm" disabled={submitting}>Request Verification</button>
        </form>
      )}

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
