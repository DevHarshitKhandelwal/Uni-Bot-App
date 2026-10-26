import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  FolderLock,
  LogOut,
  MessageSquareText,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AppDownloadModal } from '../common/AppDownloadModal.jsx';
import { SpotlightModal } from '../common/SpotlightModal.jsx';

const navigationItems = [
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'vault', label: 'My Vault', icon: FolderLock },
  { id: 'studybot', label: 'StudyBot', icon: MessageSquareText },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, isAuthenticated, logout, openAuth } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [bouncingTab, setBouncingTab] = useState(null);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSpotlightOpen((open) => !open);
        setMoreOpen(false);
      }
      if (event.key === 'Escape') setMoreOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMoreOpen(false);
    setBouncingTab(tab);
    window.setTimeout(() => setBouncingTab(null), 500);
  };

  const openSearch = () => {
    setMoreOpen(false);
    setIsSpotlightOpen(true);
  };

  const openDownload = () => {
    setMoreOpen(false);
    setIsAppDownloadOpen(true);
  };

  return (
    <>
      <nav className="app-dock" aria-label="Main navigation">
        <div className="app-dock-links">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`app-dock-item${activeTab === id ? ' active' : ''}${bouncingTab === id ? ' dock-bounce' : ''}`}
              onClick={() => selectTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-label={label}
              title={label}
            >
              <Icon size={22} aria-hidden="true" />
              {activeTab === id && <span className="app-dock-dot" />}
              {!isAuthenticated && id === 'vault' && <span className="app-dock-badge" />}
              <span className="app-dock-tooltip">{label}</span>
            </button>
          ))}
        </div>

        <span className="app-dock-divider" aria-hidden="true" />

        <div className="app-dock-actions">
          <button
            type="button"
            className="app-dock-item app-dock-search"
            onClick={openSearch}
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search size={18} />
            <span className="app-dock-tooltip">Search</span>
          </button>
          <button
            type="button"
            className="app-dock-item app-dock-download"
            onClick={openDownload}
            aria-label="Download the mobile app"
            title="Download app"
          >
            <Smartphone size={18} />
            <span className="app-dock-tooltip">Get App</span>
          </button>

          <div className="app-nav-more-wrap">
            <button
              type="button"
              className={`app-dock-item app-nav-more${moreOpen ? ' active' : ''}`}
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label="More options"
              title="Account"
            >
              {isAuthenticated && user?.avatarUrl
                ? <img className="app-nav-avatar" src={user.avatarUrl} alt="" />
                : <MoreHorizontal size={20} />}
              <span className="app-dock-tooltip">
                {isAuthenticated && user?.fullName ? user.fullName.split(' ')[0] : 'Account'}
              </span>
            </button>

            {moreOpen && (
              <>
                <button
                  type="button"
                  className="app-nav-dismiss"
                  aria-label="Close more options"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="app-nav-menu" role="menu" aria-label="More options">
                  {isAuthenticated && user ? (
                    <>
                      <div className="app-nav-menu-user">
                        <UserRound size={16} />
                        <span>{user.fullName || user.username}</span>
                      </div>
                      <button
                        type="button"
                        className="app-nav-menu-item"
                        role="menuitem"
                        onClick={() => { logout(); setMoreOpen(false); }}
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="app-nav-menu-item"
                        role="menuitem"
                        onClick={() => { openAuth('login'); setMoreOpen(false); }}
                      >
                        <UserRound size={16} />
                        <span>Sign in</span>
                      </button>
                      <button
                        type="button"
                        className="app-nav-menu-item"
                        role="menuitem"
                        onClick={() => { openAuth('register'); setMoreOpen(false); }}
                      >
                        <UserRound size={16} />
                        <span>Create account</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        onClose={() => setIsAppDownloadOpen(false)}
      />
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectTab={selectTab}
        onOpenDownloadApp={openDownload}
      />
    </>
  );
};
