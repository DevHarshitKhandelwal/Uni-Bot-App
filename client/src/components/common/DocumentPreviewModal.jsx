import React from 'react';
import { X, Download, FileText, Calendar, User, BookOpen, ExternalLink, Terminal } from 'lucide-react';

export const DocumentPreviewModal = ({ document, onClose, onDownload }) => {
  if (!document) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid var(--border-sky)',
          boxShadow: 'var(--mac-window-shadow)',
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
              onClick={onClose} 
              title="Close (Esc)" 
            />
            <span 
              className="traffic-dot yellow" 
              onClick={onClose} 
              title="Minimize" 
            />
            <span 
              className="traffic-dot green" 
              title="Zoom Preview" 
            />
          </div>

          {/* Centered Window Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '65%',
            overflow: 'hidden',
          }}>
            <FileText size={15} style={{ color: 'var(--primary-navy)', flexShrink: 0 }} />
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-main)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {document.title || document.fileName}
            </span>
            <span className="badge badge-code" style={{ fontSize: '10px', padding: '1px 6px' }}>
              Quick Look
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
            title="Close Preview"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px clamp(16px, 3vw, 24px)', overflowY: 'auto', flex: 1, backgroundColor: '#FAFDFE' }}>
          
          {/* Document Inspector Strip */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
            padding: '10px 14px',
            backgroundColor: '#E3F2FD',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-sky)',
            fontSize: '12.5px',
          }}>
            {document.subjectName && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(144, 202, 249, 0.5)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subject:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{document.subjectName}</strong>
              </div>
            )}
            {document.subjectCode && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(144, 202, 249, 0.5)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Code:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)' }}>{document.subjectCode}</strong>
              </div>
            )}
            {document.semester && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(144, 202, 249, 0.5)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Semester:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>Sem {document.semester}</strong>
              </div>
            )}
            {document.category && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(144, 202, 249, 0.5)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <strong style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{document.category.replace('_', ' ')}</strong>
              </div>
            )}
            {document.fileSize && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(144, 202, 249, 0.5)', marginLeft: 'auto' }}>
                <span style={{ color: 'var(--text-muted)' }}>Size:</span>
                <strong>{(document.fileSize / 1024).toFixed(1)} KB</strong>
              </div>
            )}
          </div>

          {/* Overview / Notes */}
          {document.description && (
            <div style={{
              marginBottom: '18px',
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary-navy)', marginBottom: '4px' }}>
                Document Description
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                {document.description}
              </p>
            </div>
          )}

          {/* Document / Content Viewer Box */}
          <div style={{
            borderRadius: 'var(--radius-md)',
            border: '1px solid #0D47A1',
            overflow: 'hidden',
            backgroundColor: '#0B2545',
            boxShadow: '0 4px 18px rgba(13, 71, 161, 0.18)',
          }}>
            {/* Window Bar */}
            <div style={{
              padding: '8px 14px',
              backgroundColor: '#081D36',
              borderBottom: '1px solid rgba(144, 202, 249, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#90CAF9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={13} style={{ color: '#27C93F' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#E3F2FD' }}>
                  {document.fileName || 'content_preview.txt'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '10.5px' }}>
                <span>UTF-8</span>
                <span style={{ color: '#90CAF9' }}>Indexed Context</span>
              </div>
            </div>

            {/* Code / Content Area */}
            <div style={{
              padding: '16px',
              color: '#F4F9FD',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '1.65',
              whiteSpace: 'pre-wrap',
              maxHeight: '260px',
              overflowY: 'auto',
            }}>
              {document.contentSnippet || document.textPreview || 'Verified academic content indexed for contextual study search.'}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{
          padding: '14px clamp(16px, 3vw, 22px)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F5F9FD',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Academic Repository • <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-navy)' }}>{document.fileName}</span>
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '7px 16px' }}>
              Done
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onDownload(document)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 18px', fontWeight: 600 }}
            >
              <Download size={15} /> Download Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
