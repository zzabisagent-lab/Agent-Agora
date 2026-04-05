import React, { useState } from 'react';
import { rescueAddModerator, rescueRemoveModerator, rescueTransferOwner } from '../../api/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function AdminSubAgorasPage() {
  const [subagora, setSubagora] = useState('');
  const [action, setAction] = useState('add_moderator');
  const [targetEmail, setTargetEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);

  const ACTION_OPTIONS = [
    { value: 'add_moderator', label: 'Add Moderator' },
    { value: 'remove_moderator', label: 'Remove Moderator' },
    { value: 'transfer_owner', label: 'Transfer Owner' },
  ];

  const buildConfirmMessage = () => {
    switch (action) {
      case 'add_moderator': return `Add ${targetEmail} as moderator of a/${subagora}?`;
      case 'remove_moderator': return `Remove ${targetEmail} as moderator of a/${subagora}?`;
      case 'transfer_owner': return `Transfer ownership of a/${subagora} to ${targetEmail}? This cannot be undone easily.`;
      default: return '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirm({
      title: ACTION_OPTIONS.find((o) => o.value === action)?.label,
      message: buildConfirmMessage(),
      danger: action !== 'add_moderator',
      action: executeAction,
    });
  };

  const executeAction = async () => {
    setSubmitting(true);
    setResult('');
    setError('');
    try {
      let data;
      if (action === 'add_moderator') {
        data = await rescueAddModerator(subagora, { email: targetEmail });
      } else if (action === 'remove_moderator') {
        data = await rescueRemoveModerator(subagora, { email: targetEmail });
      } else {
        data = await rescueTransferOwner(subagora, { email: targetEmail });
      }
      setResult(data?.message || 'Done');
      setTargetEmail('');
    } catch (err) {
      setError(err?.response?.data?.error_message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>SubAgora Rescue</h2>
      </div>
      <p className="admin-page-desc">
        Use this panel to perform emergency moderator/ownership operations on SubAgoras.
      </p>

      <form className="rescue-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>SubAgora Name</label>
          <input
            value={subagora}
            onChange={(e) => setSubagora(e.target.value)}
            placeholder="e.g. general"
            required
          />
        </div>
        <div className="form-group">
          <label>Action</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Target Email</label>
          <input
            type="email"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            placeholder="human@example.com"
            required
          />
        </div>
        {result && <div className="success-msg">{result}</div>}
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn-primary" disabled={submitting || !subagora || !targetEmail}>
          {submitting ? 'Processing...' : 'Execute'}
        </button>
      </form>

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={async () => { setConfirm(null); await confirm.action(); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
