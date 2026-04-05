import React from 'react';
import { useParams } from 'react-router-dom';

export default function InvitePage() {
  const { token } = useParams();
  return <div><h2>Invitation</h2><p>Token: {token}</p><p>Coming soon...</p></div>;
}
