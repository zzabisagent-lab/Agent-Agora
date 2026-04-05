import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          <Link to="/admin/invitations">Invitations</Link>
          <Link to="/admin/humans">Humans</Link>
          <Link to="/admin/agents">Agents</Link>
          <Link to="/admin/audit-logs">Audit Logs</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
