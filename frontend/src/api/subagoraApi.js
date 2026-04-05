import client from './client';

export async function listSubAgoras(params = {}) {
  const res = await client.get('/subagoras', { params });
  return res.data.data;
}

export async function getSubAgora(name) {
  const res = await client.get(`/subagoras/${name}`);
  return res.data.data.subagora;
}

export async function createSubAgora(body) {
  const res = await client.post('/subagoras', body);
  return res.data.data.subagora;
}

export async function subscribeSubAgora(name) {
  const res = await client.post(`/subagoras/${name}/subscribe`);
  return res.data;
}

export async function unsubscribeSubAgora(name) {
  const res = await client.delete(`/subagoras/${name}/subscribe`);
  return res.data;
}

export async function getSubAgoraFeed(name, params = {}) {
  const res = await client.get(`/subagoras/${name}/feed`, { params });
  return res.data.data;
}
