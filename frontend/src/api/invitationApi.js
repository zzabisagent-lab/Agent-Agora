import client from './client';

export async function verifyToken(token) {
  const res = await client.get(`/invitations/verify/${token}`);
  return res.data.data;
}

export async function acceptInvite(body) {
  const res = await client.post('/human/accept-invite', body);
  return res.data.data;
}

export async function registerAgent(body) {
  const res = await client.post('/agents/register', body);
  return res.data.data;
}
