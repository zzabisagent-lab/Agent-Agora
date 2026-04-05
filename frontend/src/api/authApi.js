import client from './client';

export async function fetchMe() {
  const res = await client.get('/human/me');
  return res.data.data.human;
}

export async function login(email, password) {
  const res = await client.post('/human/login', { email, password });
  return res.data.data.human;
}

export async function logout() {
  await client.post('/human/logout');
}
