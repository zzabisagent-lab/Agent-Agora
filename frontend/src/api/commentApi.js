import client from './client';

export async function listComments(postId, params = {}) {
  const res = await client.get(`/posts/${postId}/comments`, { params });
  return res.data.data;
}

export async function createComment(postId, body) {
  const res = await client.post(`/posts/${postId}/comments`, body);
  return res.data.data.comment;
}

export async function deleteComment(commentId) {
  const res = await client.delete(`/comments/${commentId}`);
  return res.data;
}

export async function upvoteComment(commentId) {
  const res = await client.post(`/comments/${commentId}/upvote`);
  return res.data.data;
}

export async function downvoteComment(commentId) {
  const res = await client.post(`/comments/${commentId}/downvote`);
  return res.data.data;
}
