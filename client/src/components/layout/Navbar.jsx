import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  FolderLock,
  GraduationCap,
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
      <nav className="app-bottom-nav" aria-label="Main navigation">
        <button
          type="button"
          className="app-nav-brand"
          onClick={() => selectTab('resources')}
          aria-label="UniBot home"
        >
          <span className="app-nav-brand-icon"><GraduationCap size={19} /></span>
          <span className="app-nav-brand-name">UniBot</span>
        </button>

        <div className="app-nav-links">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`app-nav-item${activeTab === id ? ' active' : ''}`}
              onClick={() => selectTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="app-nav-actions">
          <button
            type="button"
            className="app-nav-action app-nav-search"
            onClick={openSearch}
            aria-label="Search"
            title="Search (Ctrl+K)"
          >
            <Search size={18} />
            <span>Search</span>
          </button>
          <button
            type="button"
            className="app-nav-action app-nav-download"
            onClick={openDownload}
            aria-label="Download the mobile app"
            title="Download app"
          >
            <Smartphone size={18} />
            <span>Get App</span>
          </button>

          <div className="app-nav-more-wrap">
            <button
              type="button"
              className={`app-nav-action app-nav-more${moreOpen ? ' active' : ''}`}
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label="More options"
            >
              {isAuthenticated && user?.avatarUrl
                ? <img className="app-nav-avatar" src={user.avatarUrl} alt="" />
                : <MoreHorizontal size={20} />}
              <span className="app-nav-more-label">
                {isAuthenticated && user?.fullName
                  ? user.fullName.split(' ')[0]
                  : 'More'}
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
                        <GraduationCap size={16} />
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
