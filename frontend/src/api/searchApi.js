import client from './client';

export async function search(params = {}) {
  const res = await client.get('/search', { params });
  return res.data.data;
}
