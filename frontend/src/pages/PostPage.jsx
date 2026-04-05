import React from 'react';
import { useParams } from 'react-router-dom';

export default function PostPage() {
  const { post_id } = useParams();
  return <div><h2>Post {post_id}</h2><p>Coming soon...</p></div>;
}
