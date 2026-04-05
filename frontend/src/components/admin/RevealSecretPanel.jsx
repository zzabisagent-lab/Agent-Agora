import React, { useState } from 'react';

export default function RevealSecretPanel({ label, secret, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box reveal-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{label}</h3>
        <p className="reveal-warning">This value is shown only once. Copy it now.</p>
        <div className="reveal-secret-box">
          <code className="reveal-secret-text">{secret}</code>
          <button className="btn-secondary btn-sm" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
