import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, FolderLock, MessageSquareText, Download, ArrowRight, X, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';

export const SpotlightModal = ({ isOpen, onClose, onSelectTab, onOpenDownloadApp }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Default quick action suggestions
  const defaultActions = [
    { id: 'tab-res', type: 'action', title: 'Open Resource Hub', subtitle: 'Browse verified course notes, PYQs & lab manuals', icon: BookOpen, action: () => { onSelectTab('resources'); onClose(); } },
    { id: 'tab-vault', type: 'action', title: 'Open My Study Vault', subtitle: 'Manage student uploads, drafts & submission deadlines', icon: FolderLock, action: () => { onSelectTab('vault'); onClose(); } },
    { id: 'tab-bot', type: 'action', title: 'Ask StudyBot Assistant', subtitle: 'Contextual Q&A over lecture notes and study data', icon: MessageSquareText, action: () => { onSelectTab('studybot'); onClose(); } },
    { id: 'act-app', type: 'action', title: 'Download UniBot App / APK', subtitle: 'Install native standalone app or download APK file', icon: Download, action: () => { onOpenDownloadApp(); onClose(); } },
  ];

  // Dynamic search execution
  useEffect(() => {
    if (!query.trim()) {
      setResults(defaultActions);
      return;
    }

    const q = query.toLowerCase();
    const filteredActions = defaultActions.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

    // Also fetch matching resources asynchronously
    let isCancelled = false;
    api.resources.getAll({ search: query }).then(res => {
      if (isCancelled) return;
      const resourceItems = (res.data || []).slice(0, 5).map(r => ({
        id: r.id || r._id,
        type: 'resource',
        title: r.title,
        subtitle: `${r.subjectName} (${r.subjectCode}) • Sem ${r.semester} • ${r.category?.replace('_', ' ')}`,
        icon: BookOpen,
        action: () => {
          onSelectTab('resources');
          onClose();
        }
      }));
      setResults([...filteredActions, ...resourceItems]);
      setSelectedIndex(0);
    }).catch(() => {
      setResults(filteredActions);
    });

    return () => { isCancelled = true; };
  }, [query]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="spotlight-overlay" onClick={onClose}>
      <div className="spotlight-modal" onClick={e => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
          <Search size={19} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder="Type a subject, topic, note, or quick action..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{ border: 'none' }}
          />
          <span className="badge badge-code" style={{ fontSize: '10px' }}>ESC to close</span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {results.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results found for "{query}". Try "Operating Systems", "DBMS", or "Vault".
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon || Sparkles;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#E3F2FD' : 'transparent',
                    border: isSelected ? '1px solid rgba(144, 202, 249, 0.7)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#2196F3' : '#F0F7FD',
                      color: isSelected ? '#FFFFFF' : '#0D47A1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: isSelected ? '#0D47A1' : 'var(--text-main)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ opacity: isSelected ? 1 : 0.2, color: 'var(--primary-blue)' }} />
                </div>
              );
            })
          )}
        </div>

        {/* Spotlight Footer */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#F5F9FD',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-faint)',
        }}>
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate, <strong>Enter</strong> to select</span>
          <span style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>Quick Spotlight Search</span>
        </div>
      </div>
    </div>
  );
};
