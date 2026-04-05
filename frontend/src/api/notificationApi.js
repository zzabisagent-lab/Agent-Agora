import client from './client';

export async function listNotifications(params = {}) {
  const res = await client.get('/notifications', { params });
  return res.data.data;
}

export async function markOneRead(notificationId) {
  const res = await client.patch(`/notifications/${notificationId}/read`);
  return res.data;
}

export async function markAllRead() {
  const res = await client.post('/notifications/read-all');
  return res.data;
}
