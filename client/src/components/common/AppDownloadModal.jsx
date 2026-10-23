import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle, 
  Wifi, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  Laptop
} from 'lucide-react';

export const AppDownloadModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Local Wi-Fi Network Address
  const localNetworkUrl = `http://10.114.107.3:5173`;

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      alert("To install on your device:\n\n• On Android/Chrome: Tap the 3 dots (⋮) menu and select 'Install app' or 'Add to Home screen'.\n• On iOS/Safari: Tap the Share button and select 'Add to Home Screen'.\n• On Windows/Edge: Click the App Available icon in the URL bar.");
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(localNetworkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid var(--border-sky)',
          boxShadow: 'var(--mac-window-shadow)',
          overflow: 'hidden',
        }}
      >
        {/* Window Chrome Header with Traffic Lights */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--palette-ice)',
        }}>
          <div className="mac-traffic-lights" style={{ gap: '8px' }}>
            <span className="traffic-dot red" onClick={onClose} title="Close" />
            <span className="traffic-dot yellow" onClick={onClose} title="Minimize" />
            <span className="traffic-dot green" title="App Center" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={16} style={{ color: 'var(--primary-navy)' }} />
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
              Download & Install UniBot App
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: '#FAFDFE' }}>
          
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #2196F3 100%)',
            color: '#FFFFFF',
            padding: '20px',
            borderRadius: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(13, 71, 161, 0.2)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  UniBot Academic Mobile & Desktop
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF', border: 'none', fontSize: '10px' }}>
                  v1.0.0
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: 1.4 }}>
                Access courses, upload assignments, and query contextual notes directly on your phone or PC with zero friction.
              </p>
            </div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}>
              <Smartphone size={28} />
            </div>
          </div>

          {/* Action 1: Android APK Download */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid var(--border-sky)',
            padding: '18px',
            marginBottom: '16px',
            boxShadow: '0 2px 10px rgba(13, 71, 161, 0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#E3F2FD',
                  color: '#0D47A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '18px',
                }}>
                  APK
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Download Android APK
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Standalone application package for Android phones & tablets
                  </p>
                </div>
              </div>

              <a
                href="/downloads/unibot.apk"
                download="unibot.apk"
                className="btn btn-primary"
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Download size={15} />
                <span>Download APK File</span>
              </a>
            </div>

            <div style={{
              backgroundColor: '#F0F7FD',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              borderLeft: '3px solid var(--primary-blue)',
            }}>
              <strong>Android Installation Steps:</strong>
              <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
                <li>Tap <strong>Download APK File</strong> above to save `unibot.apk` locally.</li>
                <li>Tap the download completion notification or find it in your Downloads folder.</li>
                <li>Select <strong>Install</strong> (if asked, allow "Install from unknown sources" for this file).</li>
              </ol>
            </div>
          </div>

          {/* Action 2: 1-Click Instant App Install (PWA) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid var(--border-sky)',
            padding: '18px',
            marginBottom: '16px',
            boxShadow: '0 2px 10px rgba(13, 71, 161, 0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#E8F4FD',
                  color: '#2196F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Laptop size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Install as Web App (Desktop & Mobile)
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Runs full-screen with offline support and zero browser address bar
                  </p>
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="btn btn-secondary"
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderColor: 'var(--primary-blue)',
                  color: 'var(--primary-navy)',
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--primary-blue)' }} />
                <span>{isInstalled ? 'App Already Installed' : 'Install App Directly'}</span>
              </button>
            </div>
          </div>

          {/* Action 3: Live Wi-Fi Mobile URL */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Wifi size={15} style={{ color: '#10B981' }} />
              <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                Access on Phone via Local Wi-Fi Network
              </strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
              Ensure your phone is connected to the same Wi-Fi network, then open this URL in Chrome or Safari:
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#E3F2FD',
              padding: '8px 14px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: '#0D47A1',
              fontWeight: 600,
            }}>
              <span>{localNetworkUrl}</span>
              <button
                onClick={copyUrl}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0D47A1',
                  border: '1px solid var(--border-sky)',
                  padding: '3px 10px',
                  fontSize: '11px',
                }}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} style={{ color: '#10B981' }} />
            MongoDB Connected • MERN Architecture
          </span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
