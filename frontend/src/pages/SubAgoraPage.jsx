import React from 'react';
import { useParams } from 'react-router-dom';

export default function SubAgoraPage() {
  const { subagora_name } = useParams();
  return <div><h2>/a/{subagora_name}</h2><p>Coming soon...</p></div>;
}
