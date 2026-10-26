import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FolderLock, 
  MessageSquareText, 
  GraduationCap, 
  LogOut, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  ShieldCheck,
  Search,
  Wifi,
  Sliders,
  Battery,
  Smartphone,
  Download,
  Volume2,
  Sun,
  Maximize2,
  Minimize2,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AppDownloadModal } from '../common/AppDownloadModal.jsx';
import { SpotlightModal } from '../common/SpotlightModal.jsx';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, logout, openAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(90);
  const [bouncingTab, setBouncingTab] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
      setCurrentTime(now.toLocaleString('en-US', options).replace(/,/g, ''));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabClick = (tab) => {
    setBouncingTab(tab);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setTimeout(() => setBouncingTab(null), 600);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <>
      {/* 1. Top System Menu Bar */}
      <div className="mac-system-bar hide-mobile">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Brand Mark */}
          <div 
            onClick={() => handleTabClick('resources')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}
          >
            <span style={{ fontSize: '14px', color: 'var(--primary-blue)' }}>✦</span>
            <span style={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--primary-navy)' }}>UniBot</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span 
              onClick={() => handleTabClick('resources')}
              style={{ color: activeTab === 'resources' ? 'var(--primary-navy)' : 'inherit', fontWeight: activeTab === 'resources' ? 600 : 500, cursor: 'pointer' }}
            >
              Resources
            </span>
            <span 
              onClick={() => handleTabClick('vault')}
              style={{ color: activeTab === 'vault' ? 'var(--primary-navy)' : 'inherit', fontWeight: activeTab === 'vault' ? 600 : 500, cursor: 'pointer' }}
            >
              Vault
            </span>
            <span 
              onClick={() => handleTabClick('studybot')}
              style={{ color: activeTab === 'studybot' ? 'var(--primary-navy)' : 'inherit', fontWeight: activeTab === 'studybot' ? 600 : 500, cursor: 'pointer' }}
            >
              StudyBot
            </span>
            <span 
              onClick={() => setIsAppDownloadOpen(true)}
              style={{ color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Smartphone size={12} /> Get Mobile App / APK
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {/* Spotlight Trigger */}
          <button
            onClick={() => setIsSpotlightOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
            title="Spotlight Search (Cmd+K)"
          >
            <Search size={12} />
            <span style={{ fontSize: '10.5px', opacity: 0.85 }}>⌘K</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.9 }}>
            <Battery size={13} style={{ color: '#10B981' }} />
            <span>100%</span>
          </div>
          
          <Wifi size={13} style={{ color: 'var(--primary-blue)' }} title="Local Wi-Fi Network Active" />
          
          {/* Control Center Toggle */}
          <button
            onClick={() => setControlCenterOpen(!controlCenterOpen)}
            style={{
              background: controlCenterOpen ? '#E3F2FD' : 'none',
              border: 'none',
              color: controlCenterOpen ? 'var(--primary-navy)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px 5px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Control Center"
          >
            <Sliders size={12} />
          </button>

          <span style={{ fontWeight: 600, color: 'var(--text-main)', marginLeft: '4px' }}>
            {currentTime || 'Fri 1:30 PM'}
          </span>
        </div>
      </div>

      {/* Control Center Popover */}
      {controlCenterOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 140 }} 
            onClick={() => setControlCenterOpen(false)} 
          />
          <div className="control-center-popover">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Sliders size={14} style={{ color: 'var(--primary-blue)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  System Control Center
                </span>
              </div>
              <button 
                onClick={() => setControlCenterOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div className="cc-tile" onClick={() => setIsAppDownloadOpen(true)}>
                <Smartphone size={16} style={{ color: 'var(--primary-blue)' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>Mobile App</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>APK & PWA</div>
                </div>
              </div>

              <div className="cc-tile">
                <Wifi size={16} style={{ color: '#10B981' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>MongoDB</div>
                  <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>Atlas Online</div>
                </div>
              </div>
            </div>

            {/* Display Brightness Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sun size={12} /> Display</span>
                <span>{brightness}%</span>
              </div>
              <div 
                className="cc-slider-track"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  setBrightness(Math.max(20, Math.min(100, pct)));
                }}
              >
                <div className="cc-slider-fill" style={{ width: `${brightness}%` }} />
              </div>
            </div>

            {/* Sound Volume Slider */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Volume2 size={12} /> Sound</span>
                <span>{volume}%</span>
              </div>
              <div 
                className="cc-slider-track"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  setVolume(Math.max(0, Math.min(100, pct)));
                }}
              >
                <div className="cc-slider-fill" style={{ width: `${volume}%` }} />
              </div>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-faint)' }}>
              <span>Theme: Blue Aurora</span>
              <span className="badge badge-code" style={{ fontSize: '9px' }}>v1.0 Ready</span>
            </div>
          </div>
        </>
      )}

      {/* 2. Main Window Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(144, 202, 249, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(13, 71, 161, 0.04)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Left: Traffic Lights + App Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Window Traffic Lights */}
            <div className="mac-traffic-lights" title="Window Controls">
              <span 
                className="traffic-dot red" 
                title="Reset View" 
                onClick={() => handleTabClick('resources')} 
              />
              <span 
                className="traffic-dot yellow" 
                title="Quick Search (Spotlight)" 
                onClick={() => setIsSpotlightOpen(true)} 
              />
              <span 
                className="traffic-dot green" 
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} 
                onClick={toggleFullscreen} 
              />
            </div>

            {/* App Brand Logo */}
            <div
              onClick={() => handleTabClick('resources')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0D47A1 0%, #2196F3 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(33, 150, 243, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                flexShrink: 0,
              }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--primary-navy)',
                    letterSpacing: '-0.025em',
                  }}>
                    UniBot
                  </span>
                  <span className="badge badge-code hide-mobile" style={{ fontSize: '10px', padding: '1px 6px' }}>
                    Academic
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Segmented Control Tab (Desktop) */}
          <nav className="hide-mobile">
            <div className="mac-segmented-control">
              <button
                onClick={() => handleTabClick('resources')}
                className={`mac-segmented-tab ${activeTab === 'resources' ? 'active' : ''}`}
              >
                <BookOpen size={15} />
                <span>Resource Hub</span>
              </button>

              <button
                onClick={() => handleTabClick('vault')}
                className={`mac-segmented-tab ${activeTab === 'vault' ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                <FolderLock size={15} />
                <span>My Vault</span>
                {!isAuthenticated && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#FF5F56',
                    display: 'inline-block',
                    marginLeft: '-2px',
                  }} />
                )}
              </button>

              <button
                onClick={() => handleTabClick('studybot')}
                className={`mac-segmented-tab ${activeTab === 'studybot' ? 'active' : ''}`}
              >
                <MessageSquareText size={15} />
                <span>StudyBot</span>
              </button>
              <button
                onClick={() => handleTabClick('admin')}
                className={`mac-segmented-tab ${activeTab === 'admin' ? 'active' : ''}`}
              >
                <ShieldCheck size={15} />
                <span>Admin</span>
              </button>
            </div>
          </nav>

          {/* Right Section / Search, Download App, Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Spotlight button */}
            <div 
              className="mac-search-pill hide-mobile"
              onClick={() => setIsSpotlightOpen(true)}
              title="Quick Search (Cmd+K)"
            >
              <Search size={14} style={{ color: 'var(--primary-blue)' }} />
              <span style={{ fontSize: '12px' }}>Search...</span>
              <kbd style={{
                background: '#E3F2FD',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#0D47A1',
                border: '1px solid rgba(144, 202, 249, 0.7)',
                fontFamily: 'var(--font-mono)'
              }}>
                ⌘K
              </kbd>
            </div>

            {/* Download App & APK Button */}
            <button
              onClick={() => setIsAppDownloadOpen(true)}
              className="btn btn-secondary btn-sm hide-mobile"
              style={{
                borderColor: 'var(--primary-blue)',
                color: 'var(--primary-navy)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              <Smartphone size={13} style={{ color: 'var(--primary-blue)' }} />
              <span>Get App / APK</span>
            </button>

            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  padding: '4px 10px 4px 6px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-sky)',
                  boxShadow: '0 1px 3px rgba(13, 71, 161, 0.05)',
                }}>
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.fullName}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid var(--border-strong)',
                    }}
                  />
                  <div className="hide-mobile" style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                      {user.fullName.split(' ')[0]}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="btn btn-secondary btn-sm hide-mobile"
                  style={{ padding: '6px 9px', color: 'var(--text-muted)' }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openAuth('login')}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary btn-sm hide-mobile"
                  onClick={() => openAuth('register')}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Hamburger button for mobile/tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm hide-desktop"
              style={{
                padding: '6px 9px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Floating Bottom Dock (Magnifying Physics & Bounce) */}
      <div className="mac-floating-dock-wrapper">
        <div className="mac-floating-dock">
          {/* Resource Hub */}
          <button
            onClick={() => handleTabClick('resources')}
            className={`dock-item ${activeTab === 'resources' ? 'active' : ''} ${bouncingTab === 'resources' ? 'dock-bounce' : ''}`}
            title="Resource Hub"
          >
            <BookOpen size={22} style={{ color: activeTab === 'resources' ? 'var(--primary-navy)' : 'var(--text-muted)' }} />
            {activeTab === 'resources' && <span className="dock-dot" />}
            <span className="dock-tooltip">Resource Hub</span>
          </button>

          {/* My Vault */}
          <button
            onClick={() => handleTabClick('vault')}
            className={`dock-item ${activeTab === 'vault' ? 'active' : ''} ${bouncingTab === 'vault' ? 'dock-bounce' : ''}`}
            title="My Vault"
          >
            <FolderLock size={22} style={{ color: activeTab === 'vault' ? 'var(--primary-navy)' : 'var(--text-muted)' }} />
            {activeTab === 'vault' && <span className="dock-dot" />}
            {!isAuthenticated && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#FF5F56',
              }} />
            )}
            <span className="dock-tooltip">My Vault</span>
          </button>

          {/* StudyBot Assistant */}
          <button
            onClick={() => handleTabClick('studybot')}
            className={`dock-item ${activeTab === 'studybot' ? 'active' : ''} ${bouncingTab === 'studybot' ? 'dock-bounce' : ''}`}
            title="StudyBot Assistant"
          >
            <MessageSquareText size={22} style={{ color: activeTab === 'studybot' ? 'var(--primary-navy)' : 'var(--text-muted)' }} />
            {activeTab === 'studybot' && <span className="dock-dot" />}
            <span className="dock-tooltip">StudyBot Assistant</span>
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '26px', backgroundColor: 'var(--border-sky)', margin: '0 2px' }} />

          {/* Spotlight Search */}
          <button
            onClick={() => setIsSpotlightOpen(true)}
            className="dock-item"
            title="Spotlight Search"
          >
            <Search size={21} style={{ color: 'var(--primary-blue)' }} />
            <span className="dock-tooltip">Spotlight (⌘K)</span>
          </button>

          {/* Get App / APK */}
          <button
            onClick={() => setIsAppDownloadOpen(true)}
            className="dock-item"
            title="Download App / APK"
          >
            <Smartphone size={21} style={{ color: '#10B981' }} />
            <span className="dock-tooltip">Get App / APK</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="mobile-drawer" style={{
            background: 'linear-gradient(180deg, #F0F7FD 0%, #FFFFFF 100%)',
            borderLeft: '1px solid var(--border-sky)',
          }}>
            {/* Drawer Header with Traffic Lights */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <div className="mac-traffic-lights">
                <span className="traffic-dot red" onClick={() => setMobileMenuOpen(false)} />
                <span className="traffic-dot yellow" />
                <span className="traffic-dot green" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-navy)' }}>UniBot</span>
                <span className="badge badge-code" style={{ fontSize: '9px' }}>v1.0</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User status card in drawer */}
            {isAuthenticated && user ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
                border: '1px solid var(--border-sky)',
                boxShadow: '0 2px 8px rgba(13, 71, 161, 0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.fullName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {user.department}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-faint)' }}>
                  <span>Semester {user.semester}</span>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#E3F2FD',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
                border: '1px solid var(--border-sky)',
              }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                  Student Sign In
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                  Log in to access your personal study vault & contextual search.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    Sign In
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => { openAuth('register'); setMobileMenuOpen(false); }}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Links in drawer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-faint)', letterSpacing: '0.05em', marginBottom: '2px' }}>
                Navigation
              </div>

              <button
                onClick={() => handleTabClick('resources')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'resources' ? '#E3F2FD' : 'transparent',
                  color: activeTab === 'resources' ? 'var(--primary-navy)' : 'var(--text-main)',
                  border: activeTab === 'resources' ? '1px solid var(--border-sky)' : 'none',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={16} style={{ color: 'var(--primary-blue)' }} /> Resource Hub
                </span>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </button>

              <button
                onClick={() => handleTabClick('admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'admin' ? '#E3F2FD' : 'transparent',
                  color: activeTab === 'admin' ? 'var(--primary-navy)' : 'var(--text-main)',
                  border: activeTab === 'admin' ? '1px solid var(--border-sky)' : 'none',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--primary-blue)' }} /> Admin
                </span>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </button>

              <button
                onClick={() => handleTabClick('vault')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'vault' ? '#E3F2FD' : 'transparent',
                  color: activeTab === 'vault' ? 'var(--primary-navy)' : 'var(--text-main)',
                  border: activeTab === 'vault' ? '1px solid var(--border-sky)' : 'none',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FolderLock size={16} style={{ color: 'var(--primary-blue)' }} /> My Vault
                </span>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </button>

              <button
                onClick={() => handleTabClick('studybot')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  backgroundColor: activeTab === 'studybot' ? '#E3F2FD' : 'transparent',
                  color: activeTab === 'studybot' ? 'var(--primary-navy)' : 'var(--text-main)',
                  border: activeTab === 'studybot' ? '1px solid var(--border-sky)' : 'none',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquareText size={16} style={{ color: 'var(--primary-blue)' }} /> StudyBot Assistant
                </span>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </button>

              <button
                onClick={() => { setIsAppDownloadOpen(true); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  color: 'var(--primary-navy)',
                  border: '1px solid var(--border-sky)',
                  marginTop: '10px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={16} style={{ color: '#10B981' }} /> Download App / APK
                </span>
                <ChevronRight size={14} style={{ opacity: 0.5 }} />
              </button>
            </div>

            {/* Drawer Footer */}
            <div style={{
              paddingTop: '14px',
              borderTop: '1px solid var(--border-light)',
              fontSize: '11px',
              color: 'var(--text-faint)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <ShieldCheck size={14} style={{ color: '#10B981' }} />
              <span>MongoDB Connected • Academic Hub</span>
            </div>
          </div>
        </>
      )}

      {/* Global Modals */}
      <AppDownloadModal 
        isOpen={isAppDownloadOpen} 
        onClose={() => setIsAppDownloadOpen(false)} 
      />

      <SpotlightModal 
        isOpen={isSpotlightOpen} 
        onClose={() => setIsSpotlightOpen(false)} 
        onSelectTab={handleTabClick}
        onOpenDownloadApp={() => setIsAppDownloadOpen(true)}
      />
    </>
  );
};
