import React, { useState, useEffect, useCallback } from 'react';
import {
  listInvitations, createInvitationHuman, createInvitationAgent,
  resendInvitation, cancelInvitation, getInvitation,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import DetailDrawer from '../../components/admin/DetailDrawer';
import RevealSecretPanel from '../../components/admin/RevealSecretPanel';

const STATUS_OPTIONS = ['', 'pending', 'accepted', 'cancelled', 'expired'];

function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : '—';
}

export default function AdminInvitationsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState('human');
  const [createEmail, setCreateEmail] = useState('');
  const [createNote, setCreateNote] = useState('');
  const [creating, setCreating] = useState(false);

  // Reveal
  const [revealSecret, setRevealSecret] = useState(null); // { label, secret }

  // Detail drawer
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Confirm modal
  const [confirm, setConfirm] = useState(null); // { title, message, action }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const data = await listInvitations(params);
      setItems(data.invitations);
      setTotal(data.total_count);
      setTotalPages(data.total_pages);
    } catch {
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openDrawer = async (inv) => {
    setDrawerItem(inv);
    setDrawerLoading(true);
    try {
      const full = await getInvitation(inv._id);
      setDrawerItem(full);
    } catch { /* use partial */ } finally {
      setDrawerLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const body = { email: createEmail };
      if (createNote) body.note = createNote;
      const fn = createType === 'human' ? createInvitationHuman : createInvitationAgent;
      const data = await fn(body);
      setRevealSecret({ label: 'Invitation Token', secret: data.invite_url || data.raw_token });
      setShowCreate(false);
      setCreateEmail('');
      setCreateNote('');
      load();
    } catch (err) {
      alert(err?.response?.data?.error_message || 'Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  const handleResend = (id) => {
    setConfirm({
      title: 'Resend Invitation',
      message: 'Generate a new token and resend the invitation?',
      action: async () => {
        const data = await resendInvitation(id);
        setRevealSecret({ label: 'New Invitation Token', secret: data.invite_url || data.raw_token });
        load();
      },
    });
  };

  const handleCancel = (id) => {
    setConfirm({
      title: 'Cancel Invitation',
      message: 'Are you sure you want to cancel this invitation?',
      danger: true,
      action: async () => { await cancelInvitation(id); load(); },
    });
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'invite_type', label: 'Type', width: 80 },
    {
      key: 'status', label: 'Status', width: 90,
      render: (r) => <span className={`badge badge-${r.status}`}>{r.status}</span>,
    },
    { key: 'expires_at', label: 'Expires', render: (r) => fmtDate(r.expires_at) },
    {
      key: 'actions', label: '', width: 160,
      render: (r) => (
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          {(r.status === 'pending') && (
            <button className="btn-sm btn-secondary" onClick={() => handleResend(r._id)}>Resend</button>
          )}
          {(r.status === 'pending') && (
            <button className="btn-sm btn-danger" onClick={() => handleCancel(r._id)}>Cancel</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Invitations</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Invitation</button>
      </div>
      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
        <span className="total-count">{total} total</span>
      </div>

      <DataTable columns={columns} rows={items} onRowClick={openDrawer} loading={loading} />

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>New Invitation</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Type</label>
                <select value={createType} onChange={(e) => setCreateType(e.target.value)}>
                  <option value="human">Human</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input value={createNote} onChange={(e) => setCreateNote(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {revealSecret && (
        <RevealSecretPanel
          label={revealSecret.label}
          secret={revealSecret.secret}
          onClose={() => setRevealSecret(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          danger={confirm.danger}
          onConfirm={async () => { await confirm.action(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {drawerItem && (
        <DetailDrawer title="Invitation Detail" onClose={() => setDrawerItem(null)}>
          {drawerLoading ? <div className="loading">Loading...</div> : (
            <dl className="detail-list">
              <dt>ID</dt><dd>{drawerItem._id}</dd>
              <dt>Email</dt><dd>{drawerItem.email}</dd>
              <dt>Type</dt><dd>{drawerItem.invite_type}</dd>
              <dt>Status</dt><dd>{drawerItem.status}</dd>
              <dt>Created</dt><dd>{fmtDate(drawerItem.created_at)}</dd>
              <dt>Expires</dt><dd>{fmtDate(drawerItem.expires_at)}</dd>
              <dt>Accepted At</dt><dd>{fmtDate(drawerItem.accepted_at)}</dd>
              <dt>Note</dt><dd>{drawerItem.note || '—'}</dd>
            </dl>
          )}
        </DetailDrawer>
      )}
    </div>
  );
}
