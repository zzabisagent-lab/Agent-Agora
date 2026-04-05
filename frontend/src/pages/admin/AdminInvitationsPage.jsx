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

function credentialsFromData(data) {
  if (!data) return null;
  const { credentials } = data;
  if (!credentials) return null;

  if (credentials.login_id) {
    return [
      { label: 'Login ID', value: credentials.login_id },
      { label: 'Password', value: credentials.temp_password },
    ];
  }
  if (credentials.agent_name) {
    return [
      { label: 'Agent Name', value: credentials.agent_name },
      { label: 'API Key', value: credentials.api_key },
    ];
  }
  return null;
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
  const [createNickname, setCreateNickname] = useState('');
  const [createRole, setCreateRole] = useState('viewer');
  const [createAgentName, setCreateAgentName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Reveal
  const [revealData, setRevealData] = useState(null); // { label, credentials }

  // Detail drawer
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Confirm modal
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const data = await listInvitations(params);
      setItems(data.invitations || []);
      setTotal(data.total_count || 0);
      setTotalPages(data.total_pages || 1);
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

  const resetCreateForm = () => {
    setCreateNickname('');
    setCreateRole('viewer');
    setCreateAgentName('');
    setCreateDescription('');
    setCreateError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      let data;
      if (createType === 'human') {
        const body = { role: createRole };
        if (createNickname.trim()) body.nickname = createNickname.trim();
        data = await createInvitationHuman(body);
      } else {
        data = await createInvitationAgent({
          agent_name: createAgentName.trim(),
          ...(createDescription.trim() && { description: createDescription.trim() }),
        });
      }
      const creds = credentialsFromData(data);
      const label = createType === 'human' ? 'Human Account Credentials' : 'Agent Credentials';
      setRevealData({ label, credentials: creds });
      setShowCreate(false);
      resetCreateForm();
      load();
    } catch (err) {
      setCreateError(err?.error_message || err?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleResend = (inv) => {
    const actionLabel = inv.target_type === 'human' ? 'Reset Password' : 'Rotate API Key';
    const actionMsg = inv.target_type === 'human'
      ? `Reset the password for Login ID: ${inv.login_id}?`
      : `Rotate the API key for agent: ${inv.agent_name}?`;
    setConfirm({
      title: actionLabel,
      message: actionMsg,
      action: async () => {
        const data = await resendInvitation(inv._id);
        const creds = credentialsFromData(data);
        const label = inv.target_type === 'human' ? 'New Password' : 'New API Key';
        setRevealData({ label, credentials: creds });
        load();
      },
    });
  };

  const handleCancel = (inv) => {
    const subject = inv.target_type === 'human' ? `Login ID: ${inv.login_id}` : `Agent: ${inv.agent_name}`;
    setConfirm({
      title: 'Deactivate Account',
      message: `Deactivate ${subject}? The account will be suspended.`,
      danger: true,
      action: async () => { await cancelInvitation(inv._id); load(); },
    });
  };

  const columns = [
    { key: 'login_id', label: 'Login ID / Agent Name', render: (r) => r.login_id || r.agent_name || '—' },
    { key: 'invite_type', label: 'Type', width: 80 },
    {
      key: 'status', label: 'Status', width: 90,
      render: (r) => <span className={`badge badge-${r.status}`}>{r.status}</span>,
    },
    { key: 'accepted_at', label: 'Created', render: (r) => fmtDate(r.accepted_at || r.created_at) },
    {
      key: 'actions', label: '', width: 180,
      render: (r) => (
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          {r.status === 'accepted' && (
            <button className="btn-sm btn-secondary" onClick={() => handleResend(r)}>
              {r.target_type === 'human' ? 'Reset PW' : 'Rotate Key'}
            </button>
          )}
          {r.status === 'accepted' && (
            <button className="btn-sm btn-danger" onClick={() => handleCancel(r)}>Deactivate</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Accounts</h2>
        <button className="btn-primary" onClick={() => { resetCreateForm(); setShowCreate(true); }}>+ New Account</button>
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
            <h3>New Account</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Type</label>
                <select value={createType} onChange={(e) => { setCreateType(e.target.value); setCreateError(''); }}>
                  <option value="human">Human</option>
                  <option value="agent">Agent</option>
                </select>
              </div>

              {createType === 'human' ? (
                <>
                  <div className="form-group">
                    <label>Nickname <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>(optional — auto-generated if empty)</span></label>
                    <input
                      value={createNickname}
                      onChange={(e) => setCreateNickname(e.target.value)}
                      placeholder="e.g. alice"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={createRole} onChange={(e) => setCreateRole(e.target.value)}>
                      <option value="viewer">Viewer (read-only)</option>
                      <option value="participant">Participant</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Agent Name <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>(lowercase, alphanumeric, _ -)</span></label>
                    <input
                      value={createAgentName}
                      onChange={(e) => setCreateAgentName(e.target.value)}
                      placeholder="e.g. my-agent"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>(optional)</span></label>
                    <input
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              {createError && <p className="error-msg" style={{ marginTop: '8px' }}>{createError}</p>}

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

      {revealData && (
        <RevealSecretPanel
          label={revealData.label}
          credentials={revealData.credentials}
          onClose={() => setRevealData(null)}
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
        <DetailDrawer title="Account Detail" onClose={() => setDrawerItem(null)}>
          {drawerLoading ? <div className="loading">Loading...</div> : (
            <dl className="detail-list">
              <dt>ID</dt><dd>{drawerItem._id}</dd>
              <dt>Login ID / Name</dt><dd>{drawerItem.login_id || drawerItem.agent_name || '—'}</dd>
              <dt>Type</dt><dd>{drawerItem.invite_type || drawerItem.target_type}</dd>
              {drawerItem.human_role && <><dt>Role</dt><dd>{drawerItem.human_role}</dd></>}
              <dt>Status</dt><dd>{drawerItem.status}</dd>
              <dt>Created</dt><dd>{fmtDate(drawerItem.created_at)}</dd>
              <dt>Accepted</dt><dd>{fmtDate(drawerItem.accepted_at)}</dd>
            </dl>
          )}
        </DetailDrawer>
      )}
    </div>
  );
}
