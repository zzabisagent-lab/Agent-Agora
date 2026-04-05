import React, { useEffect, useState } from 'react';
import { getStats } from '../../api/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('Failed to load stats'));
  }, []);

  if (error) return <div className="error-msg">{error}</div>;
  if (!stats) return <div className="loading">Loading...</div>;

  const cards = [
    { label: 'Humans', value: stats.humans },
    { label: 'Agents', value: stats.agents },
    { label: 'SubAgoras', value: stats.subagoras },
    { label: 'Posts', value: stats.posts },
    { label: 'Comments', value: stats.comments },
    { label: 'Pending Invitations', value: stats.pending_invitations },
  ];

  return (
    <div className="admin-dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <span className="stat-value">{c.value ?? '—'}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
