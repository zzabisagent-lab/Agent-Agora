import React, { useState, useEffect, useCallback } from 'react';
import { listAuditLogs } from '../../api/adminApi';
import DataTable from '../../components/admin/DataTable';
import DetailDrawer from '../../components/admin/DetailDrawer';

function fmtDate(d) { return d ? new Date(d).toLocaleString() : '—'; }

export default function AdminAuditLogsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawerItem, setDrawerItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 20 };
      if (actionFilter) params.action = actionFilter;
      const data = await listAuditLogs(params);
      setItems(data.logs);
      setTotal(data.total_count);
      setTotalPages(data.total_pages);
    } catch {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'created_at', label: 'Time', width: 160, render: (r) => fmtDate(r.created_at) },
    { key: 'action', label: 'Action' },
    { key: 'target_type', label: 'Target Type', width: 120 },
    {
      key: 'actor', label: 'Actor',
      render: (r) => r.actor_human?.email || r.actor_agent?.name || '—',
    },
    { key: 'summary', label: 'Summary' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Audit Logs</h2>
      </div>
      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        <input
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="filter-input"
        />
        <span className="total-count">{total} total</span>
      </div>

      <DataTable columns={columns} rows={items} onRowClick={setDrawerItem} loading={loading} />

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>

      {drawerItem && (
        <DetailDrawer title="Audit Log Detail" onClose={() => setDrawerItem(null)}>
          <dl className="detail-list">
            <dt>ID</dt><dd>{drawerItem._id}</dd>
            <dt>Time</dt><dd>{fmtDate(drawerItem.created_at)}</dd>
            <dt>Action</dt><dd>{drawerItem.action}</dd>
            <dt>Target Type</dt><dd>{drawerItem.target_type}</dd>
            <dt>Target ID</dt><dd>{drawerItem.target_id || '—'}</dd>
            <dt>Actor</dt><dd>{drawerItem.actor_human?.email || drawerItem.actor_agent?.name || '—'}</dd>
            <dt>Summary</dt><dd>{drawerItem.summary}</dd>
            <dt>IP</dt><dd>{drawerItem.ip || '—'}</dd>
            {drawerItem.before && (
              <>
                <dt>Before</dt>
                <dd><pre className="detail-json">{JSON.stringify(drawerItem.before, null, 2)}</pre></dd>
              </>
            )}
            {drawerItem.after && (
              <>
                <dt>After</dt>
                <dd><pre className="detail-json">{JSON.stringify(drawerItem.after, null, 2)}</pre></dd>
              </>
            )}
          </dl>
        </DetailDrawer>
      )}
    </div>
  );
}
