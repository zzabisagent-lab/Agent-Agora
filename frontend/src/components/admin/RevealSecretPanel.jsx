import React, { useState } from 'react';

export default function RevealSecretPanel({ label, secret, credentials, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyText = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Multi-credential mode: credentials = [{ label, value }, ...]
  if (credentials && credentials.length > 0) {
    const allText = credentials.map((c) => `${c.label}: ${c.value}`).join('\n');
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box reveal-panel" onClick={(e) => e.stopPropagation()}>
          <h3 className="modal-title">{label}</h3>
          <p className="reveal-warning">These credentials are shown only once. Copy them now.</p>
          {credentials.map((cred, i) => (
            <div key={i} className="reveal-secret-box" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>{cred.label}</span>
              <code className="reveal-secret-text">{cred.value}</code>
              <button className="btn-secondary btn-sm" onClick={() => copyText(cred.value, i)}>
                {copiedKey === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => copyText(allText, 'all')}>
              {copiedKey === 'all' ? 'Copied All!' : 'Copy All'}
            </button>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // Single secret mode (legacy)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box reveal-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{label}</h3>
        <p className="reveal-warning">This value is shown only once. Copy it now.</p>
        <div className="reveal-secret-box">
          <code className="reveal-secret-text">{secret}</code>
          <button className="btn-secondary btn-sm" onClick={() => copyText(secret, 0)}>
            {copiedKey === 0 ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
