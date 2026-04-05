import React, { useState, useEffect } from 'react';
import { listNotifications, markAllRead, markOneRead } from '../api/notificationApi';

export default function NotificationsPage() {
  const [data, setData] = useState({ items: [], unread_count: 0, has_next: false, next_cursor: null });
  const [loading, setLoading] = useState(true);

  async function load(cursor = null, reset = false) {
    setLoading(true);
    try {
      const result = await listNotifications({ cursor, limit: 25 });
      setData((prev) => ({
        ...result,
        items: reset ? result.items : [...prev.items, ...result.items],
      }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(null, true); }, []);

  async function handleMarkAll() {
    await markAllRead();
    setData((d) => ({ ...d, unread_count: 0, items: d.items.map((n) => ({ ...n, is_read: true })) }));
  }

  async function handleMarkOne(id) {
    await markOneRead(id);
    setData((d) => ({
      ...d,
      items: d.items.map((n) => n._id === id ? { ...n, is_read: true } : n),
      unread_count: Math.max(0, d.unread_count - 1),
    }));
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications {data.unread_count > 0 && <span className="unread-badge">{data.unread_count}</span>}</h2>
        {data.unread_count > 0 && (
          <button onClick={handleMarkAll} className="btn-text">Mark all read</button>
        )}
      </div>
      {loading && <div className="loading">Loading...</div>}
      {!loading && data.items.length === 0 && <div className="empty-state">No notifications</div>}
      <div className="notification-list">
        {data.items.map((n) => (
          <div key={n._id} className={`notification-item${n.is_read ? '' : ' unread'}`} onClick={() => !n.is_read && handleMarkOne(n._id)}>
            <p>{n.message}</p>
            <span className="notification-time">{new Date(n.created_at).toLocaleString()}</span>
            {!n.is_read && <span className="unread-dot" />}
          </div>
        ))}
      </div>
      {data.has_next && !loading && (
        <button onClick={() => load(data.next_cursor)} className="load-more-btn">Load more</button>
      )}
    </div>
  );
}
