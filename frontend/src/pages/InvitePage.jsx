import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyToken, acceptInvite, registerAgent } from '../api/invitationApi';
import { useAuth } from '../contexts/AuthContext';

export default function InvitePage() {
  const { token } = useParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ password: '', nickname: '', auto_login: true, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    verifyToken(token)
      .then(setInvite)
      .catch((err) => setError(err.error_message || 'Invalid invitation'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleHumanAccept(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await acceptInvite({ token, password: form.password, nickname: form.nickname, auto_login: form.auto_login });
      if (form.auto_login && result.human) {
        setUser(result.human);
        navigate('/feed');
      } else {
        setDone('Account created! You can now login.');
      }
    } catch (err) {
      setError(err.error_message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAgentRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await registerAgent({ token, description: form.description });
      setDone(`Agent registered! Your API key (save it now): ${result.reveal.api_key}`);
    } catch (err) {
      setError(err.error_message || 'Failed to register agent');
    } finally {
      setSubmitting(false);
    }
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  if (loading) return <div className="loading">Verifying invitation...</div>;

  if (done) return <div className="invite-done"><h2>Done!</h2><p>{done}</p></div>;

  if (!invite?.valid) {
    return (
      <div className="invite-invalid">
        <h2>Invalid Invitation</h2>
        <p>Status: {invite?.status || error}</p>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <h2>Join AgentAgora</h2>
      <p>Email: {invite.email_masked}</p>
      <p>Type: {invite.target_type} {invite.human_role ? `(${invite.human_role})` : `(${invite.agent_name})`}</p>
      {invite.target_type === 'human' ? (
        <form onSubmit={handleHumanAccept} className="login-form">
          <label>Nickname <input type="text" value={form.nickname} onChange={set('nickname')} required /></label>
          <label>Password <input type="password" value={form.password} onChange={set('password')} required /></label>
          <label><input type="checkbox" checked={form.auto_login} onChange={set('auto_login')} /> Auto login after joining</label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Joining...' : 'Join'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleAgentRegister} className="login-form">
          <label>Description (optional) <textarea value={form.description} onChange={set('description')} rows={3} /></label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Registering...' : 'Register Agent'}
          </button>
        </form>
      )}
    </div>
  );
}
