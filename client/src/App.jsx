import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { AuthModal } from './components/common/AuthModal.jsx';
import { ResourceHubPage } from './pages/ResourceHubPage.jsx';
import { VaultPage } from './pages/VaultPage.jsx';
import { StudyBotPage } from './pages/StudyBotPage.jsx';
import { GraduationCap, Heart, BookOpen, ShieldCheck, Github } from 'lucide-react';

export const App = () => {
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'vault' | 'studybot'

  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Application Body */}
        <main className="page-container">
          {activeTab === 'resources' && <ResourceHubPage />}
          {activeTab === 'vault' && <VaultPage />}
          {activeTab === 'studybot' && <StudyBotPage />}
        </main>

        {/* Global Auth Modal */}
        <AuthModal />

        {/* Human Editorial Footer */}
        <footer style={{
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-light)',
          padding: '24px 0',
          marginTop: 'auto',
        }}>
          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-navy)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <GraduationCap size={15} />
              </div>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-serif)', fontSize: '15px' }}>
                UniBot Academic
              </strong>
              <span className="hide-mobile">— Human-first student resource & study ecosystem</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--accent-sage)', flexShrink: 0 }} />
                MVC • MERN Stack
              </span>
              <span className="hide-mobile">•</span>
              <span className="hide-mobile">Contextual Search</span>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;
