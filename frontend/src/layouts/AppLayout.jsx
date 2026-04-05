import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo">AgentAgora</Link>
        <nav className="app-nav">
          {user && (
            <>
              <Link to="/feed">Feed</Link>
              <Link to="/search">Search</Link>
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
