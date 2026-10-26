import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, KeyRound, LockKeyhole, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const panelStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-light)',
  borderRadius: '16px',
  padding: 'clamp(20px, 4vw, 32px)',
  boxShadow: '0 8px 28px rgba(13, 71, 161, 0.06)',
};

const statusLabel = (status) => {
  if (status === 'quota_exhausted') return 'Quota limit reached';
  if (status === 'ready') return 'Recent request succeeded';
  if (status === 'not_configured') return 'Provider key not configured';
  return 'Not enough usage data';
};

export const AdminPage = () => {
  const { user, loading: authLoading, loginAdmin } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    const response = await api.admin.getAiSettings();
    setSettings(response.data);
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let active = true;
    const load = async () => {
      try {
        const response = await api.admin.getAiSettings();
        if (active) {
          setSettings(response.data);
          setError('');
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Could not load AI status.');
      }
    };
    load();
    const interval = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isAdmin]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAdmin(username, password);
      setPassword('');
    } catch (loginError) {
      setError(loginError.message || 'Administrator sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (provider) => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await api.admin.setAiProvider(provider);
      await refreshSettings();
      setNotice(`Chat provider switched to ${provider === 'openai' ? 'OpenAI' : 'Gemini'}.`);
    } catch (requestError) {
      setError(requestError.message || 'Could not switch the provider.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <main className="container" style={{ padding: '48px 0' }}>Loading account…</main>;
  }

  if (!isAdmin) {
    return (
      <main className="container" style={{ maxWidth: '560px', padding: 'clamp(32px, 8vw, 72px) 16px' }}>
        <section style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <LockKeyhole size={24} color="var(--primary-blue)" />
            <div>
              <h1 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '24px' }}>Administrator sign-in</h1>
              <p style={{ margin: '5px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Use the admin credentials configured in Render.
              </p>
            </div>
          </div>
          {error && <div role="alert" style={{ color: '#B42318', marginBottom: '14px' }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <label className="form-label" htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              className="form-input"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <label className="form-label" htmlFor="admin-password" style={{ display: 'block', marginTop: '14px' }}>Password</label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
              {loading ? 'Signing in…' : 'Sign in as administrator'}
            </button>
          </form>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5, margin: '16px 0 0' }}>
            The shared default password is intentionally disabled. Set a unique password of at least 16 characters in Render.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: '960px', padding: 'clamp(28px, 6vw, 56px) 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', fontSize: '13px', fontWeight: 700 }}>
            <ShieldCheck size={17} /> ADMINISTRATOR
          </div>
          <h1 style={{ color: 'var(--primary-navy)', margin: '8px 0 0', fontSize: 'clamp(26px, 5vw, 36px)' }}>AI service status</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>Monitor the chatbot connection and select a configured provider.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => refreshSettings().catch((e) => setError(e.message))} disabled={loading} aria-label="Refresh AI status">
          <RefreshCw size={15} /> Refresh
        </button>
      </header>

      {error && <div role="alert" style={{ ...panelStyle, color: '#B42318', marginBottom: '16px', padding: '14px' }}>{error}</div>}
      {notice && <div role="status" style={{ ...panelStyle, color: '#027A48', marginBottom: '16px', padding: '14px' }}>{notice}</div>}

      <section style={{ ...panelStyle, marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          {settings?.ragReady
            ? <CheckCircle2 color="#12B76A" />
            : <AlertTriangle color="#DC6803" />}
          <h2 style={{ margin: 0, color: 'var(--primary-navy)', fontSize: '18px' }}>
            Chatbot {settings?.ragReady ? 'ready' : 'not ready'}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
          <StatusCard icon={<Activity size={18} />} label="Retrieval" value={settings?.retrievalMode || 'Loading…'} />
          <StatusCard icon={<KeyRound size={18} />} label="Embedding quota state" value={statusLabel(settings?.providerStatus?.gemini || settings?.quotaStatus)} />
          <StatusCard icon={<Activity size={18} />} label="Selected model status" value={statusLabel(settings?.providerStatus?.[settings?.activeProvider] || 'unknown')} />
          <StatusCard icon={<ShieldCheck size={18} />} label="Selected provider" value={settings?.activeProvider || 'Loading…'} />
        </div>
        {settings?.message && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '14px 0 0' }}>{settings.message}</p>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.55, margin: '16px 0 0' }}>
          Gemini does not provide this app with an exact remaining-credit balance. This status reflects service health and quota errors observed by the app; check Google AI Studio for account usage and billing.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: '0 0 6px', color: 'var(--primary-navy)', fontSize: '18px' }}>Chat generation provider</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px' }}>
          Only providers with API keys configured in the RAG service’s Render environment can be selected. Keys are never sent to the browser.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <ProviderCard
            name="Gemini"
            provider="gemini"
            active={settings?.activeProvider === 'gemini'}
            configured={settings?.providers?.gemini === true}
            loading={loading}
            onSelect={handleProviderChange}
          />
          <ProviderCard
            name="OpenAI"
            provider="openai"
            active={settings?.activeProvider === 'openai'}
            configured={settings?.providers?.openai === true}
            loading={loading}
            onSelect={handleProviderChange}
          />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.55, margin: '16px 0 0' }}>
          When Gemini embedding quota is exhausted, UniBot can use BM25 keyword retrieval while the vector index is unavailable. The selected model provider still needs available quota to generate answers.
        </p>
      </section>
    </main>
  );
};

const StatusCard = ({ icon, label, value }) => (
  <div style={{ background: '#F5F9FD', borderRadius: '12px', padding: '14px' }}>
    <div style={{ color: 'var(--primary-blue)', marginBottom: '8px' }}>{icon}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 700, marginTop: '4px', textTransform: 'capitalize' }}>{value}</div>
  </div>
);

const ProviderCard = ({ name, provider, active, configured, loading, onSelect }) => (
  <div style={{ border: `1px solid ${active ? 'var(--primary-blue)' : 'var(--border-light)'}`, borderRadius: '12px', padding: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
      <strong style={{ color: 'var(--primary-navy)' }}>{name}</strong>
      {configured ? <CheckCircle2 size={17} color="#12B76A" aria-label="Configured" /> : <XCircle size={17} color="#98A2B3" aria-label="Not configured" />}
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '8px 0 14px' }}>
      {configured ? (active ? 'Currently selected' : 'API key configured') : 'API key not configured in Render'}
    </p>
    <button
      type="button"
      className={active ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
      disabled={!configured || active || loading}
      onClick={() => onSelect(provider)}
    >
      {active ? 'Active' : `Use ${name}`}
    </button>
  </div>
);
