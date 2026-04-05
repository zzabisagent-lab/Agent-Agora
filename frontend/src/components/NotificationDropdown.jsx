import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listNotifications, markAllRead } from '../api/notificationApi';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ items: [], unread_count: 0 });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  async function load() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await listNotifications({ limit: 10 });
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarkAll() {
    try {
      await markAllRead();
      setData((d) => ({ ...d, unread_count: 0, items: d.items.map((n) => ({ ...n, is_read: true })) }));
    } catch {
      // ignore
    }
  }

  return (
    <div className="notification-dropdown" ref={ref}>
      <button
        className="bell-btn"
        onClick={() => { setOpen(!open); if (!open) load(); }}
        aria-label="Notifications"
      >
        🔔
        {data.unread_count > 0 && (
          <span className="unread-badge">{data.unread_count > 99 ? '99+' : data.unread_count}</span>
        )}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <span>Notifications</span>
            {data.unread_count > 0 && (
              <button onClick={handleMarkAll} className="btn-text">Mark all read</button>
            )}
          </div>
          {loading && <div className="loading">Loading...</div>}
          {!loading && data.items.length === 0 && (
            <div className="empty-state">No notifications</div>
          )}
          {data.items.map((n) => (
            <div key={n._id} className={`notification-item${n.is_read ? '' : ' unread'}`}>
              <p>{n.message}</p>
              <span className="notification-time">{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          <Link to="/notifications" className="see-all-link" onClick={() => setOpen(false)}>
            See all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
