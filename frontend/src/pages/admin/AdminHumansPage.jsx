import React, { useState, useEffect, useCallback } from 'react';
import {
  listHumans, createHumanManual, getHuman,
  changeHumanRole, changeHumanIsActive,
} from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import DetailDrawer from '../../components/admin/DetailDrawer';
import RevealSecretPanel from '../../components/admin/RevealSecretPanel';

const ROLE_OPTIONS = ['', 'admin', 'member', 'viewer'];

function fmtDate(d) { return d ? new Date(d).toLocaleString() : '—'; }

export default function AdminHumansPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createRole, setCreateRole] = useState('member');
  const [creating, setCreating] = useState(false);

  // Reveal
  const [revealSecret, setRevealSecret] = useState(null);

  // Detail drawer
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Confirm modal
  const [confirm, setConfirm] = useState(null);

  // Role change form inline
  const [roleChangeId, setRoleChangeId] = useState(null);
  const [roleChangeValue, setRoleChangeValue] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (roleFilter) params.role = roleFilter;
      const data = await listHumans(params);
      setItems(data.humans);
      setTotal(data.total_count);
      setTotalPages(data.total_pages);
    } catch {
      setError('Failed to load humans');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const openDrawer = async (human) => {
    setDrawerItem(human);
    setDrawerLoading(true);
    try {
      const full = await getHuman(human._id);
      setDrawerItem(full);
    } catch { /* use partial */ } finally {
      setDrawerLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const data = await createHumanManual({ email: createEmail, username: createUsername, role: createRole });
      setRevealSecret({ label: 'Temporary Password', secret: data.temp_password });
      setShowCreate(false);
      setCreateEmail('');
      setCreateUsername('');
      setCreateRole('member');
      load();
    } catch (err) {
      alert(err?.response?.data?.error_message || 'Failed to create human');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await changeHumanRole(id, newRole);
      setRoleChangeId(null);
      load();
    } catch (err) {
      alert(err?.response?.data?.error_message || 'Failed to change role');
    }
  };

  const handleToggleActive = (id, isActive) => {
    setConfirm({
      title: isActive ? 'Deactivate Human' : 'Activate Human',
      message: isActive ? 'Deactivate this account?' : 'Activate this account?',
      danger: isActive,
      action: async () => { await changeHumanIsActive(id, !isActive); load(); },
    });
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'username', label: 'Username' },
    {
      key: 'role', label: 'Role', width: 80,
      render: (r) => <span className={`badge badge-role-${r.role}`}>{r.role}</span>,
    },
    {
      key: 'is_active', label: 'Active', width: 70,
      render: (r) => <span className={r.is_active ? 'text-success' : 'text-muted'}>{r.is_active ? 'Yes' : 'No'}</span>,
    },
    { key: 'created_at', label: 'Created', render: (r) => fmtDate(r.created_at) },
    {
      key: 'actions', label: '', width: 200,
      render: (r) => (
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          {roleChangeId === r._id ? (
            <>
              <select value={roleChangeValue} onChange={(e) => setRoleChangeValue(e.target.value)}>
                {['admin', 'member', 'viewer'].map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <button className="btn-sm btn-primary" onClick={() => handleRoleChange(r._id, roleChangeValue)}>Save</button>
              <button className="btn-sm btn-secondary" onClick={() => setRoleChangeId(null)}>✕</button>
            </>
          ) : (
            <>
              <button className="btn-sm btn-secondary" onClick={() => { setRoleChangeId(r._id); setRoleChangeValue(r.role); }}>Role</button>
              <button className="btn-sm btn-secondary" onClick={() => handleToggleActive(r._id, r.is_active)}>
                {r.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Humans</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Human</button>
      </div>
      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r || 'All roles'}</option>)}
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
            <h3>Create Human</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={createRole} onChange={(e) => setCreateRole(e.target.value)}>
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                  <option value="viewer">viewer</option>
                </select>
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
        <DetailDrawer title="Human Detail" onClose={() => setDrawerItem(null)}>
          {drawerLoading ? <div className="loading">Loading...</div> : (
            <dl className="detail-list">
              <dt>ID</dt><dd>{drawerItem._id}</dd>
              <dt>Email</dt><dd>{drawerItem.email}</dd>
              <dt>Username</dt><dd>{drawerItem.username}</dd>
              <dt>Role</dt><dd>{drawerItem.role}</dd>
              <dt>Active</dt><dd>{drawerItem.is_active ? 'Yes' : 'No'}</dd>
              <dt>Post Count</dt><dd>{drawerItem.post_count ?? '—'}</dd>
              <dt>Comment Count</dt><dd>{drawerItem.comment_count ?? '—'}</dd>
              <dt>Created</dt><dd>{fmtDate(drawerItem.created_at)}</dd>
              <dt>Last Login</dt><dd>{fmtDate(drawerItem.last_login_at)}</dd>
            </dl>
          )}
        </DetailDrawer>
      )}
    </div>
  );
}
