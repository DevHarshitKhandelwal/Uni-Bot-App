import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  Lock,
  ArrowRight,
  Eye,
  FileCheck,
  X,
  Folder,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentPreviewModal } from '../components/common/DocumentPreviewModal.jsx';

export const VaultPage = () => {
  const { user, isAuthenticated, openAuth, demoLogin } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  // New assignment modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload to existing assignment
  const [uploadingToId, setUploadingToId] = useState(null);

  const fetchAssignments = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.assignments.getAll();
      if (res.success) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssignments();
    }
  }, [isAuthenticated]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subjectName', subjectName);
      formData.append('dueDate', dueDate);
      formData.append('priority', priority);
      formData.append('notes', notes);

      for (let i = 0; i < filesToUpload.length; i++) {
        formData.append('files', filesToUpload[i]);
      }

      const res = await api.assignments.create(formData);
      if (res.success) {
        setIsCreateOpen(false);
        setTitle('');
        setSubjectName('');
        setDueDate('');
        setPriority('medium');
        setNotes('');
        setFilesToUpload([]);
        fetchAssignments();
      }
    } catch (err) {
      alert(err.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.assignments.updateStatus(id, status);
      if (res.success) {
        setAssignments(prev => prev.map(a => (a.id === id || a._id === id ? res.data : a)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment and its uploaded files?')) return;
    try {
      const res = await api.assignments.delete(id);
      if (res.success) {
        setAssignments(prev => prev.filter(a => a.id !== id && a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileDownload = (assignmentId, fileItem) => {
    const url = api.assignments.getFileDownloadUrl(assignmentId, fileItem.storedFileName || fileItem.fileName);
    window.open(url, '_blank');
  };

  const handleAdditionalFileUpload = async (assignmentId, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      const res = await api.assignments.uploadFiles(assignmentId, formData);
      if (res.success) {
        fetchAssignments();
        setUploadingToId(null);
      }
    } catch (err) {
      alert(err.message || 'File upload failed');
    }
  };

  // If not logged in, show student vault lock screen with macOS FileVault styling
  if (!isAuthenticated) {
    return (
      <div style={{ padding: 'clamp(30px, 6vw, 60px) 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border-strong)',
            overflow: 'hidden',
            boxShadow: 'var(--mac-window-shadow)',
          }}>
            {/* macOS Window Chrome Header */}
            <div style={{
              padding: '12px 18px',
              backgroundColor: 'var(--palette-cream)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div className="mac-traffic-lights" style={{ gap: '8px' }}>
                <span className="traffic-dot red" />
                <span className="traffic-dot yellow" />
                <span className="traffic-dot green" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Personal Vault — Locked Student Partition
              </span>
              <div style={{ width: '48px' }} />
            </div>

            <div style={{ padding: 'clamp(28px, 5vw, 44px) clamp(20px, 4vw, 36px)' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--palette-rose)',
                color: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 4px 14px rgba(255, 206, 216, 0.8)',
              }}>
                <Lock size={32} />
              </div>

              <div className="badge badge-rose" style={{ marginBottom: '12px' }}>
                Personal Vault Restricted
              </div>

              <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', color: 'var(--text-main)', marginBottom: '12px' }}>
                Encrypted Student Assignment Vault
              </h2>

              <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '26px' }}>
                Manage coursework deadlines, store drafts, download sample submissions, and let UniBot answer questions directly from your private files.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => openAuth('login')}
                  style={{ padding: '11px 24px' }}
                >
                  Log In to Vault
                </button>
                <button
                  className="btn btn-peach"
                  onClick={() => demoLogin()}
                  style={{ padding: '11px 24px' }}
                >
                  1-Click Demo Student Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Count metrics
  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const totalFiles = assignments.reduce((acc, a) => acc + (a.files?.length || 0), 0);

  return (
    <div style={{ padding: '20px 0 40px' }}>
      <div className="container">

        {/* macOS Finder Toolbar Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--mac-window-shadow)',
          marginBottom: '24px',
          overflow: 'hidden',
        }}>
          {/* Top Window Chrome */}
          <div style={{
            padding: '12px 18px',
            backgroundColor: 'var(--palette-cream)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="mac-traffic-lights" style={{ gap: '8px' }}>
                <span className="traffic-dot red" />
                <span className="traffic-dot yellow" />
                <span className="traffic-dot green" />
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
              }}>
                <span>Academic Hub</span>
                <span>▸</span>
                <span>Users</span>
                <span>▸</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.fullName?.split(' ')[0] || 'student'}</span>
                <span>▸</span>
                <span className="badge badge-code" style={{ fontSize: '10px', padding: '1px 6px' }}>Vault</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                {user?.department} • Sem {user?.semester || 4}
              </span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsCreateOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
              >
                <Plus size={15} /> New Assignment
              </button>
            </div>
          </div>

          {/* Subheader Title */}
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: 'var(--text-main)', margin: '0 0 4px' }}>
                Assignment Vault & Submissions
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Store coursework, solve problems with UniBot, and monitor upcoming deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row Styled with the 4 Specific Colors: #FFCED8, #FFE8C4, #FFDDDD, #FFF4DE */}
        <div className="stats-grid" style={{ marginBottom: '28px' }}>
          {/* Card 1: #FFCED8 (Soft Rose) */}
          <div style={{
            backgroundColor: 'var(--palette-rose)',
            border: '1px solid rgba(226, 183, 193, 0.9)',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.15s ease',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#8C223A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Pending Tasks
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#681527' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '11px', color: '#8C223A', marginTop: '4px' }}>
              Action required
            </div>
          </div>

          {/* Card 2: #FFE8C4 (Golden Peach) */}
          <div style={{
            backgroundColor: 'var(--palette-peach)',
            border: '1px solid rgba(240, 200, 140, 0.9)',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.15s ease',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7A4A00', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              In Progress
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#5C3800' }}>
              {inProgressCount}
            </div>
            <div style={{ fontSize: '11px', color: '#7A4A00', marginTop: '4px' }}>
              Drafts & revisions
            </div>
          </div>

          {/* Card 3: #FFDDDD (Blush Pink) */}
          <div style={{
            backgroundColor: 'var(--palette-blush)',
            border: '1px solid rgba(235, 190, 190, 0.9)',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.15s ease',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#4D6B53', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Completed
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#2B4A31' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '11px', color: '#4D6B53', marginTop: '4px' }}>
              Submitted tasks
            </div>
          </div>

          {/* Card 4: #FFF4DE (Warm Cream) */}
          <div style={{
            backgroundColor: 'var(--palette-cream)',
            border: '1px solid rgba(230, 215, 185, 0.9)',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.15s ease',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#C44563', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Indexed Files
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#8A1E38' }}>
              {totalFiles}
            </div>
            <div style={{ fontSize: '11px', color: '#C44563', marginTop: '4px' }}>
              Available to UniBot
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div className="badge badge-code" style={{ marginBottom: '10px' }}>Loading Vault Data...</div>
            <p>Accessing encrypted student partition...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed var(--border-strong)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--palette-cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--primary-navy)',
            }}>
              <FolderLock size={32} />
            </div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>
              Your vault is currently empty
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px' }}>
              Organize homework tasks, attach lab writeups, and ask UniBot to summarize or evaluate your drafts.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} /> Create First Assignment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {assignments.map(asgn => {
              const asgnId = asgn.id || asgn._id;

              return (
                <div
                  key={asgnId}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--mac-window-shadow)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Assignment macOS Card Header */}
                  <div style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--palette-cream)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: asgn.priority === 'high' ? 'var(--mac-traffic-red)' : asgn.priority === 'medium' ? 'var(--mac-traffic-yellow)' : 'var(--mac-traffic-green)',
                          display: 'inline-block',
                        }} 
                        title={`${asgn.priority} priority`}
                      />
                      <span className="badge badge-code" style={{ fontSize: '11px' }}>
                        {asgn.subjectName}
                      </span>
                      <span className={`badge ${
                        asgn.priority === 'high' ? 'badge-danger' : asgn.priority === 'medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {asgn.priority.toUpperCase()}
                      </span>
                      {asgn.dueDate && (
                        <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          Due: {new Date(asgn.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Status dropdown & Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        className="form-select"
                        value={asgn.status}
                        onChange={(e) => handleStatusChange(asgnId, e.target.value)}
                        style={{
                          fontSize: '12px',
                          padding: '5px 10px',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: asgn.status === 'completed' ? 'var(--palette-blush)' : asgn.status === 'in_progress' ? 'var(--palette-peach)' : '#FFFFFF',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-strong)',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteAssignment(asgnId)}
                        title="Delete Assignment"
                        style={{ color: 'var(--accent-terracotta)', padding: '5px 8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: 'clamp(16px, 3vw, 22px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', color: 'var(--text-main)', margin: '0 0 6px', wordBreak: 'break-word' }}>
                        {asgn.title}
                      </h2>
                      {asgn.description && (
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-word' }}>
                          {asgn.description}
                        </p>
                      )}
                    </div>

                    {/* Notes if available */}
                    {asgn.notes && (
                      <div style={{
                        backgroundColor: 'var(--palette-blush)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        borderLeft: '4px solid var(--primary-navy)',
                        wordBreak: 'break-word',
                      }}>
                        <strong>Student Notes:</strong> {asgn.notes}
                      </div>
                    )}

                    {/* Attached Files List (macOS Finder Directory View) */}
                    <div style={{
                      backgroundColor: '#FAF8F5',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'clamp(12px, 2.5vw, 16px)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '12px',
                      }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Folder size={15} style={{ color: 'var(--primary-navy)' }} /> 
                          Files Attached ({asgn.files?.length || 0})
                        </div>

                        <label style={{ cursor: 'pointer' }}>
                          <span className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Upload size={13} /> Add Files
                          </span>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleAdditionalFileUpload(asgnId, e)}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      {asgn.files && asgn.files.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {asgn.files.map((file, fIdx) => (
                            <div
                              key={fIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#FFFFFF',
                                padding: '9px 12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-light)',
                                flexWrap: 'wrap',
                                gap: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px', minWidth: '0' }}>
                                <FileText size={17} style={{ color: 'var(--primary-navy)', flexShrink: 0 }} />
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.fileName}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                                    {(file.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setPreviewDoc({ ...file, title: file.fileName, subjectName: asgn.subjectName })}
                                  title="Quick Look Preview"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Eye size={13} /> Quick Look
                                </button>
                                <button
                                  className="btn btn-rose btn-sm"
                                  onClick={() => handleFileDownload(asgnId, file)}
                                  title="Download File"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Download size={13} /> Download
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                          No files attached yet. Click "Add Files" to attach problem sheets or solutions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={(doc) => {
            const parent = assignments.find(a => a.files?.some(f => f.fileName === doc.fileName));
            if (parent) {
              handleFileDownload(parent.id || parent._id, doc);
            }
          }}
        />
      )}

      {/* New Assignment Modal - macOS Sheet Styling */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '560px',
              borderRadius: '16px',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--mac-window-shadow)',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            {/* macOS Window Chrome Header */}
            <div style={{
              padding: '12px 18px',
              backgroundColor: 'var(--palette-cream)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div className="mac-traffic-lights" style={{ gap: '8px' }}>
                <span className="traffic-dot red" onClick={() => setIsCreateOpen(false)} title="Cancel" />
                <span className="traffic-dot yellow" onClick={() => setIsCreateOpen(false)} title="Minimize" />
                <span className="traffic-dot green" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderLock size={15} style={{ color: 'var(--primary-navy)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Create New Assignment
                </span>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ padding: '20px clamp(16px, 3vw, 24px)', overflowY: 'auto', flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lab 4: Banker's Algorithm Simulation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Course / Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Operating Systems"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority (Urgent)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Attach Files (PDFs, Source Code, Rubric)</label>
                <input
                  type="file"
                  multiple
                  className="form-input"
                  onChange={(e) => setFilesToUpload(Array.from(e.target.files))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px', display: 'block' }}>
                  Files will be indexed so UniBot can answer questions directly from them.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Personal Notes / Guidelines</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Needs to compile on gcc 11 without warnings. Due by 11:59 PM."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
