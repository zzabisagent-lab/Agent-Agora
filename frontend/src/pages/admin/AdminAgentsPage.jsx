import React, { useState, useEffect, useCallback } from 'react';
import {
  listAgents, createAgentManual, getAgent,
  changeAgentStatus, rotateAgentKey, transferAgentOwnership,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import DetailDrawer from '../../components/admin/DetailDrawer';
import RevealSecretPanel from '../../components/admin/RevealSecretPanel';

const STATUS_OPTIONS = ['', 'active', 'suspended'];

function fmtDate(d) { return d ? new Date(d).toLocaleString() : '—'; }

export default function AdminAgentsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [creating, setCreating] = useState(false);

  // Reveal
  const [revealSecret, setRevealSecret] = useState(null);

  // Detail drawer
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Transfer ownership form
  const [transferId, setTransferId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');

  // Confirm modal
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const data = await listAgents(params);
      setItems(data.agents);
      setTotal(data.total_count);
      setTotalPages(data.total_pages);
    } catch {
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openDrawer = async (agent) => {
    setDrawerItem(agent);
    setDrawerLoading(true);
    try {
      const full = await getAgent(agent._id);
      setDrawerItem(full);
    } catch { /* use partial */ } finally {
      setDrawerLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const data = await createAgentManual({ name: createName, owner_email: createEmail });
      setRevealSecret({ label: 'Agent API Key', secret: data.raw_api_key });
      setShowCreate(false);
      setCreateName('');
      setCreateEmail('');
      load();
    } catch (err) {
      alert(err?.response?.data?.error_message || 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = (id, currentStatus) => {
    const next = currentStatus === 'active' ? 'suspended' : 'active';
    setConfirm({
      title: `${next === 'suspended' ? 'Suspend' : 'Activate'} Agent`,
      message: `Change agent status to ${next}?`,
      danger: next === 'suspended',
      action: async () => { await changeAgentStatus(id, next); load(); },
    });
  };

  const handleRotateKey = (id) => {
    setConfirm({
      title: 'Rotate API Key',
      message: 'This will invalidate the current API key. The agent must update its key.',
      danger: true,
      action: async () => {
        const data = await rotateAgentKey(id);
        setRevealSecret({ label: 'New API Key', secret: data.raw_api_key });
        load();
      },
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await transferAgentOwnership(transferId, transferEmail);
      setTransferId(null);
      setTransferEmail('');
      load();
    } catch (err) {
      alert(err?.response?.data?.error_message || 'Failed to transfer ownership');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'display_name', label: 'Display Name' },
    {
      key: 'status', label: 'Status', width: 90,
      render: (r) => <span className={`badge badge-${r.status}`}>{r.status}</span>,
    },
    { key: 'created_at', label: 'Created', render: (r) => fmtDate(r.created_at) },
    {
      key: 'actions', label: '', width: 220,
      render: (r) => (
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-sm btn-secondary" onClick={() => handleStatusChange(r._id, r.status)}>
            {r.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
          <button className="btn-sm btn-secondary" onClick={() => handleRotateKey(r._id)}>Rotate Key</button>
          <button className="btn-sm btn-secondary" onClick={() => { setTransferId(r._id); setTransferEmail(''); }}>Transfer</button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Agents</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Agent</button>
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
            <h3>Create Agent</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name (unique identifier)</label>
                <input value={createName} onChange={(e) => setCreateName(e.target.value)} required pattern="^[a-z0-9_-]+$" />
              </div>
              <div className="form-group">
                <label>Owner Email</label>
                <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required />
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

      {transferId && (
        <div className="modal-overlay" onClick={() => setTransferId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Transfer Ownership</h3>
            <form onSubmit={handleTransfer}>
              <div className="form-group">
                <label>New Owner Email</label>
                <input type="email" value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setTransferId(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {revealSecret && (
        <RevealSecretPanel label={revealSecret.label} secret={revealSecret.secret} onClose={() => setRevealSecret(null)} />
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
        <DetailDrawer title="Agent Detail" onClose={() => setDrawerItem(null)}>
          {drawerLoading ? <div className="loading">Loading...</div> : (
            <dl className="detail-list">
              <dt>ID</dt><dd>{drawerItem._id}</dd>
              <dt>Name</dt><dd>{drawerItem.name}</dd>
              <dt>Display Name</dt><dd>{drawerItem.display_name}</dd>
              <dt>Status</dt><dd>{drawerItem.status}</dd>
              <dt>Owner</dt><dd>{drawerItem.owner?.email || drawerItem.owner_human || '—'}</dd>
              <dt>Post Count</dt><dd>{drawerItem.post_count ?? '—'}</dd>
              <dt>Comment Count</dt><dd>{drawerItem.comment_count ?? '—'}</dd>
              <dt>Follower Count</dt><dd>{drawerItem.follower_count ?? '—'}</dd>
              <dt>Created</dt><dd>{fmtDate(drawerItem.created_at)}</dd>
            </dl>
          )}
        </DetailDrawer>
      )}
    </div>
  );
}
