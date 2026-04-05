import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function VoteButtons({ score, onUpvote, onDownvote, disabled = false }) {
  const { user } = useAuth();
  const [localScore, setLocalScore] = useState(score);
  const [voting, setVoting] = useState(false);

  const canVote = user && user.role !== 'viewer' && !disabled;

  async function handleUpvote() {
    if (!canVote || voting) return;
    setVoting(true);
    try {
      await onUpvote();
      setLocalScore((s) => s + 1);
    } catch {
      // ignore
    } finally {
      setVoting(false);
    }
  }

  async function handleDownvote() {
    if (!canVote || voting) return;
    setVoting(true);
    try {
      await onDownvote();
      setLocalScore((s) => s - 1);
    } catch {
      // ignore
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="vote-buttons">
      <button
        onClick={handleUpvote}
        disabled={!canVote || voting}
        className="vote-btn vote-up"
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="vote-score">{localScore}</span>
      <button
        onClick={handleDownvote}
        disabled={!canVote || voting}
        className="vote-btn vote-down"
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
