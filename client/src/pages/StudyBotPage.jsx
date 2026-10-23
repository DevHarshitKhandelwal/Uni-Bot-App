import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  FolderLock, 
  FileText, 
  Download, 
  ExternalLink, 
  HelpCircle,
  GraduationCap,
  Info,
  CheckCircle,
  User,
  Bot,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentPreviewModal } from '../components/common/DocumentPreviewModal.jsx';

export const StudyBotPage = () => {
  const { user, isAuthenticated, openAuth, demoLogin } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hello ${user ? user.fullName.split(' ')[0] : 'there'}! I am **UniBot**, your contextual academic companion.

I can answer questions grounded directly in your university course materials, lecture notes, PYQs, and any personal assignments or drafts in your vault.

Try asking about **Operating Systems Deadlocks**, **DBMS Normalization**, or **"What assignments are due?"**`,
      citations: [
        {
          title: 'Operating Systems — Unit 2 Notes',
          pageOrSection: 'Unit 2: Process Scheduling & Deadlocks',
          snippet: 'Banker\'s algorithm and Coffman deadlock conditions',
          fileUrl: '/uploads/samples/Operating_Systems_Unit2_Notes.pdf',
        },
        {
          title: 'DBMS 2024 Solved PYQ',
          pageOrSection: 'Model Solutions',
          snippet: 'BCNF decomposition and candidate keys',
          fileUrl: '/uploads/samples/DBMS_EndSem_2024_Solved_PYQ.pdf',
        }
      ],
      timestamp: new Date(),
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [scope, setScope] = useState('all_resources'); // 'all_resources' | 'my_vault'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isSending) return;

    if (scope === 'my_vault' && !isAuthenticated) {
      openAuth('login');
      return;
    }

    const userMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      citations: [],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsSending(true);

    try {
      const res = await api.chat.sendMessage({
        prompt: textToSend,
        scope,
        selectedSubject,
        sessionId,
      });

      if (res.success) {
        if (!sessionId) setSessionId(res.data.sessionId);
        setMessages(prev => [...prev, {
          id: 'asst_' + Date.now(),
          sender: 'assistant',
          text: res.data.message.text,
          citations: res.data.message.citations || [],
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: `⚠️ I encountered an issue retrieving that information: ${err.message}. Please check your backend connection.`,
        citations: [],
        timestamp: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const promptSuggestions = [
    { label: "Explain Banker's Algorithm from OS Unit 2", query: "Explain Banker's Algorithm from Unit 2 lecture notes" },
    { label: "What are BCNF rules in DBMS 2024 PYQ?", query: "What are BCNF decomposition rules in DBMS 2024 PYQ?" },
    { label: "What assignments are due in my vault?", query: "What assignments are due in my vault?" },
    { label: "Subnetting Cheatsheet in Networks", query: "Show me CIDR subnetting calculations from Computer Networks" },
  ];

  return (
    <div style={{ padding: '16px 0 30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ maxWidth: '1040px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* macOS Window Outer Shell */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--mac-window-shadow)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '620px',
          overflow: 'hidden',
        }}>
          
          {/* macOS Window Chrome Header */}
          <div style={{
            padding: '12px 18px',
            backgroundColor: 'var(--palette-cream)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            {/* Traffic Lights */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="mac-traffic-lights" style={{ gap: '8px' }}>
                <span className="traffic-dot red" title="Close" />
                <span className="traffic-dot yellow" title="Minimize" />
                <span className="traffic-dot green" title="Maximize" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={16} style={{ color: 'var(--primary-navy)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  UniBot Assistant
                </span>
                <span className="badge badge-code" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  Contextual RAG
                </span>
              </div>
            </div>

            {/* macOS Segmented Tab Scope Selector */}
            <div className="mac-segmented-control">
              <button
                type="button"
                className={`mac-segmented-tab ${scope === 'all_resources' ? 'active' : ''}`}
                onClick={() => setScope('all_resources')}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <BookOpen size={13} /> Course Materials
              </button>
              <button
                type="button"
                className={`mac-segmented-tab ${scope === 'my_vault' ? 'active' : ''}`}
                onClick={() => {
                  if (!isAuthenticated) openAuth('login');
                  else setScope('my_vault');
                }}
                style={{ fontSize: '12px', padding: '5px 12px' }}
              >
                <FolderLock size={13} /> Vault Files
              </button>
            </div>
          </div>

          {/* Context Notice Strip (Peach / Cream Palette) */}
          <div style={{
            padding: '8px 18px',
            backgroundColor: 'var(--palette-peach)',
            borderBottom: '1px solid rgba(184, 107, 18, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12px',
            color: '#7A4A00',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: '#B86B12' }} />
              <span>
                <strong>Academic Grounding:</strong> Answering with verified references from semester notes & papers.
              </span>
            </div>

            {!isAuthenticated && (
              <button
                className="btn btn-rose btn-sm"
                onClick={() => demoLogin()}
                style={{ fontSize: '11px', padding: '3px 10px' }}
              >
                Try Demo Account
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(16px, 3vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            backgroundColor: '#FAF8F5',
          }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  {/* Sender identity */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--text-faint)',
                    marginBottom: '4px',
                    padding: '0 4px',
                  }}>
                    {isUser ? (
                      <>
                        <span style={{ fontWeight: 600 }}>{user ? user.fullName : 'You (Student)'}</span>
                        <User size={12} />
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--palette-rose)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Bot size={11} style={{ color: 'var(--primary-navy)' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>UniBot Assistant</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    maxWidth: 'min(94%, 720px)',
                    backgroundColor: isUser ? 'linear-gradient(180deg, #D44E6D 0%, #B83B58 100%)' : '#FFFFFF',
                    background: isUser ? 'linear-gradient(180deg, #D44E6D 0%, #B83B58 100%)' : '#FFFFFF',
                    color: isUser ? 'var(--text-inverse)' : 'var(--text-main)',
                    padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                    borderRadius: '16px',
                    borderBottomRightRadius: isUser ? '4px' : '16px',
                    borderBottomLeftRadius: !isUser ? '4px' : '16px',
                    fontSize: '13.5px',
                    lineHeight: '1.65',
                    border: isUser ? '1px solid rgba(138, 30, 56, 0.4)' : '1px solid var(--border-light)',
                    boxShadow: isUser ? '0 2px 8px rgba(196, 69, 99, 0.2)' : '0 2px 8px rgba(42, 31, 36, 0.04)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.text}

                    {/* Citations block for Assistant responses */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div style={{
                        marginTop: '14px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-light)',
                      }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--text-muted)',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}>
                          <BookOpen size={12} style={{ color: 'var(--primary-navy)' }} /> Verified Academic Citations:
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {msg.citations.map((cite, cIdx) => (
                            <div
                              key={cIdx}
                              onClick={() => setPreviewDoc({
                                title: cite.title,
                                fileName: cite.title,
                                textPreview: cite.snippet,
                                contentSnippet: cite.snippet,
                                subjectCode: cite.pageOrSection,
                                fileUrl: cite.fileUrl,
                              })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'var(--palette-cream)',
                                border: '1px solid rgba(226, 183, 193, 0.7)',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                gap: '8px',
                              }}
                              title="Click to view Quick Look preview"
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: '0' }}>
                                <FileText size={14} style={{ color: 'var(--primary-navy)', flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, color: 'var(--primary-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {cite.title}
                                </span>
                                <span style={{ color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  • {cite.pageOrSection}
                                </span>
                              </div>
                              <span className="badge badge-rose" style={{ fontSize: '10px', padding: '1px 6px', flexShrink: 0 }}>
                                Quick Look
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--palette-cream)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                border: '1px solid var(--border-light)',
                maxWidth: 'fit-content',
              }}>
                <Bot size={15} style={{ color: 'var(--primary-navy)' }} />
                <span>Searching course files and synthesizing answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestion Bar (macOS Touch Bar style) */}
          <div className="scroll-touch" style={{
            padding: '8px 16px',
            backgroundColor: 'var(--palette-blush)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px',
          }}>
            {promptSuggestions.map((ps, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(ps.query)}
                disabled={isSending}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(226, 183, 193, 0.8)',
                  color: 'var(--text-main)',
                  fontSize: '11px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(42, 31, 36, 0.04)',
                }}
              >
                <Sparkles size={11} style={{ color: '#B86B12' }} />
                {ps.label}
              </button>
            ))}
          </div>

          {/* macOS Input Area */}
          <div style={{
            padding: '14px 18px',
            backgroundColor: 'var(--palette-cream)',
            borderTop: '1px solid var(--border-light)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-strong)',
              padding: '4px 6px 4px 16px',
              boxShadow: '0 2px 6px rgba(42, 31, 36, 0.04)',
            }}>
              <input
                type="text"
                placeholder={
                  scope === 'my_vault'
                    ? "Ask about your uploaded assignments & drafts..."
                    : "Ask about lecture notes, formulas, PYQs..."
                }
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13.5px',
                  color: 'var(--text-main)',
                  backgroundColor: 'transparent',
                  padding: '6px 0',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="hide-mobile" style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '2px', marginRight: '4px' }}>
                  <CornerDownLeft size={11} /> Return
                </span>

                <button
                  className="btn btn-primary"
                  onClick={() => handleSend()}
                  disabled={isSending || !inputPrompt.trim()}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} />
                  <span className="hide-mobile">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={(doc) => {
            if (doc.fileUrl) window.open(doc.fileUrl, '_blank');
          }}
        />
      )}
    </div>
  );
};
