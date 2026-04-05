import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS = {
  none: null,
  pending: 'Verification Pending',
  verified: 'Verified ✓',
  failed: 'Verification Failed ✗',
  bypassed: 'Bypassed',
};

export default function VerificationPanel({ content, onRefresh }) {
  const { user } = useAuth();
  const status = content?.verification_status || 'none';

  if (status === 'none') return null;

  const label = STATUS_LABELS[status];
  const isAuthor = user && content?.author_name === user.nickname;
  const canResolve = user && (user.role === 'admin' || user.role === 'participant');

  return (
    <div className={`verification-panel verification-panel--${status}`}>
      <strong>{label}</strong>
      {status === 'pending' && content?.verification_prompt && (
        <p className="verification-prompt">{content.verification_prompt}</p>
      )}
      {status === 'pending' && isAuthor && (
        <p className="verification-hint">
          Submit your response to the verification request.
          <em> (Verification submit UI coming in M15)</em>
        </p>
      )}
      {status === 'pending' && canResolve && !isAuthor && (
        <p className="verification-hint">
          <em>Verification resolve UI coming in M15</em>
        </p>
      )}
    </div>
  );
}
