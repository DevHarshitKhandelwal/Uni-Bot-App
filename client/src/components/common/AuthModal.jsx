import React, { useState } from 'react';
import { X, GraduationCap, Lock, Mail, User, Building, BookOpen, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuth, authModalTab, setAuthModalTab, login, register, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('National Institute of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(4);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register({
          fullName,
          email,
          password,
          institution,
          department,
          semester: Number(semester),
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuth}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '480px',
          borderRadius: '18px',
          border: '1px solid var(--border-sky)',
          boxShadow: 'var(--mac-window-shadow)',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Window Chrome Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--palette-ice)',
          position: 'relative',
        }}>
          {/* Traffic Lights */}
          <div className="mac-traffic-lights" style={{ gap: '8px' }}>
            <span 
              className="traffic-dot red" 
              onClick={closeAuth} 
              title="Close (Esc)" 
            />
            <span 
              className="traffic-dot yellow" 
              onClick={closeAuth} 
              title="Minimize" 
            />
            <span 
              className="traffic-dot green" 
              title="Zoom" 
            />
          </div>

          {/* Centered Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} style={{ color: 'var(--primary-navy)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-navy)' }}>
              Student Vault Access
            </span>
          </div>

          <button
            onClick={closeAuth}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Segmented Tab Switch */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#F5F9FD',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div className="mac-segmented-control" style={{ width: '100%', maxWidth: '320px' }}>
            <button
              type="button"
              className={`mac-segmented-tab ${authModalTab === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthModalTab('login'); setError(''); }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mac-segmented-tab ${authModalTab === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthModalTab('register'); setError(''); }}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: 'clamp(18px, 3.5vw, 24px)', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              marginBottom: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Login Banner */}
          <div style={{
            marginBottom: '20px',
            padding: '12px 14px',
            backgroundColor: '#E3F2FD',
            border: '1px solid var(--border-sky)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            boxShadow: '0 2px 6px rgba(13, 71, 161, 0.06)',
          }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} style={{ color: 'var(--primary-blue)' }} /> Demo Student Pass
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Pre-loaded account: Alex Vance (Sem 4, CSE)
              </div>
            </div>
            <button
              type="button"
              className="btn btn-navy btn-sm"
              onClick={handleDemo}
              disabled={loading}
              style={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '11.5px' }}
            >
              1-Click Demo Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {authModalTab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maya Chen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option>Computer Science & Engineering</option>
                      <option>Electronics & Communication</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      className="form-select"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">College Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px', padding: '11px', fontSize: '14px', fontWeight: 600 }}
            >
              {loading ? 'Authenticating...' : authModalTab === 'login' ? 'Unlock Student Vault' : 'Complete Registration'}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '10px 18px',
          backgroundColor: '#F5F9FD',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center',
          fontSize: '11.5px',
          color: 'var(--text-faint)',
        }}>
          Encrypted student workspace with verified academic credentials.
        </div>
      </div>
    </div>
  );
};
