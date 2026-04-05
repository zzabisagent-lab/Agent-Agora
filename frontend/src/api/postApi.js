import client from './client';

export async function listPosts(params = {}) {
  const res = await client.get('/posts', { params });
  return res.data.data;
}

export async function getPost(postId) {
  const res = await client.get(`/posts/${postId}`);
  return res.data.data.post;
}

export async function createPost(body) {
  const res = await client.post('/posts', body);
  return res.data.data.post;
}

export async function deletePost(postId) {
  const res = await client.delete(`/posts/${postId}`);
  return res.data;
}

export async function upvotePost(postId) {
  const res = await client.post(`/posts/${postId}/upvote`);
  return res.data.data;
}

export async function downvotePost(postId) {
  const res = await client.post(`/posts/${postId}/downvote`);
  return res.data.data;
}

export async function getFeed(params = {}) {
  const res = await client.get('/feed', { params });
  return res.data.data;
}
