import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Eye, 
  ThumbsUp, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Calendar,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentPreviewModal } from '../components/common/DocumentPreviewModal.jsx';

export const ResourceHubPage = () => {
  const { user, isAuthenticated, openAuth } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('all');
  const [category, setCategory] = useState('all');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Contribute modal
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [contributeForm, setContributeForm] = useState({
    title: '',
    description: '',
    subjectCode: '',
    subjectName: '',
    semester: 4,
    category: 'lecture_note',
    tags: '',
  });
  const [contributeFile, setContributeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.resources.getAll({
        semester,
        category,
        search,
      });
      if (res.success) {
        setResources(res.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [semester, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    try {
      const res = await api.resources.toggleUpvote(id);
      if (res.success) {
        setResources(prev => prev.map(r => (r.id === id || r._id === id ? res.data : r)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (doc) => {
    const id = doc.id || doc._id;
    window.open(api.resources.getDownloadUrl(id), '_blank');
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(contributeForm).forEach(([k, v]) => formData.append(k, v));
      if (contributeFile) {
        formData.append('file', contributeFile);
      }
      const res = await api.resources.create(formData);
      if (res.success) {
        setIsContributeOpen(false);
        setContributeForm({
          title: '',
          description: '',
          subjectCode: '',
          subjectName: '',
          semester: 4,
          category: 'lecture_note',
          tags: '',
        });
        setContributeFile(null);
        fetchResources();
      }
    } catch (err) {
      alert(err.message || 'Failed to upload resource');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'lecture_note', label: 'Lecture Notes' },
    { id: 'pyq', label: 'PYQs & Solutions' },
    { id: 'lab_manual', label: 'Lab Manuals' },
    { id: 'cheatsheet', label: 'Cheat Sheets' },
    { id: 'syllabus', label: 'Syllabi' },
  ];

  return (
    <div style={{ padding: '24px 0 40px' }}>
      <div className="container">
        {/* macOS Style Editorial Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 244, 222, 0.95) 0%, rgba(255, 232, 196, 0.8) 50%, rgba(255, 206, 216, 0.6) 100%)',
          border: '1px solid rgba(255, 206, 216, 0.85)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(20px, 3.5vw, 36px) clamp(16px, 3.5vw, 36px)',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(42, 31, 36, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '640px', flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div className="mac-traffic-lights" style={{ opacity: 0.85 }}>
                <span className="traffic-dot red" />
                <span className="traffic-dot yellow" />
                <span className="traffic-dot green" />
              </div>
              <span className="badge badge-rose">
                Verified Repository
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(20px, 3.5vw, 28px)',
              color: 'var(--text-main)',
              lineHeight: '1.25',
              marginBottom: '10px',
              fontWeight: 700,
            }}>
              Curated University Resources & Course Notes
            </h1>
            <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Access peer-verified lecture slides, previous year question papers with answer keys, and laboratory manuals. All files are pre-indexed for instant study questions in UniBot.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: 'auto' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!isAuthenticated) openAuth('login');
                else setIsContributeOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', width: 'auto' }}
            >
              <Upload size={16} /> Contribute Resource
            </button>
          </div>
        </div>

        {/* macOS Spotlight Filter & Search Bar */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 206, 216, 0.7)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px clamp(12px, 2.5vw, 20px)',
          marginBottom: '24px',
          boxShadow: '0 4px 14px rgba(42, 31, 36, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {/* Top Row: Search and Semester Filter */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 240px', minWidth: '0', position: 'relative' }}>
              <Search size={17} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
              }} />
              <input
                type="text"
                className="form-input"
                placeholder="Spotlight search: course code, notes, PYQ, topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  paddingRight: '60px',
                  width: '100%',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 244, 222, 0.6)',
                  borderColor: 'rgba(226, 183, 193, 0.8)',
                }}
              />
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(226, 183, 193, 0.8)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-faint)',
              }}>
                ⌘K
              </span>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Sem:</span>
              <select
                className="form-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{
                  width: 'auto',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 244, 222, 0.6)',
                  borderColor: 'rgba(226, 183, 193, 0.8)',
                }}
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Chips with Touch-Scroll */}
          <div className="scroll-touch" style={{
            display: 'flex',
            gap: '8px',
            paddingBottom: '4px',
          }}>
            {categories.map(c => {
              const isActive = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    backgroundColor: isActive ? '#C44563' : 'rgba(255, 221, 221, 0.6)',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                    border: isActive ? '1px solid #C44563' : '1px solid rgba(226, 183, 193, 0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 2px 6px rgba(196, 69, 99, 0.25)' : 'none',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading academic materials...
          </div>
        ) : resources.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed rgba(226, 183, 193, 0.8)',
          }}>
            <BookOpen size={36} style={{ color: 'var(--text-faint)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '6px' }}>No resources found</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
              No documents matched your current search filters. Try clearing your search or contribute the first note!
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setSearch(''); setSemester('all'); setCategory('all'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="resource-cards-grid">
            {resources.map(res => {
              const resId = res.id || res._id;
              const hasUpvoted = user && res.upvotes && res.upvotes.includes(user.id);

              return (
                <div
                  key={resId}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '18px clamp(14px, 2.5vw, 20px)',
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.92)',
                  }}
                >
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      <span className="badge badge-code">{res.subjectCode}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge" style={{ backgroundColor: 'var(--palette-blush)' }}>Sem {res.semester}</span>
                        <span className="badge badge-rose" style={{ textTransform: 'capitalize' }}>
                          {res.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subject */}
                    <h3 style={{
                      fontSize: '16px',
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                      lineHeight: '1.4',
                      cursor: 'pointer',
                      wordBreak: 'break-word',
                      fontWeight: 600,
                    }}
                    onClick={() => setPreviewDoc(res)}
                    >
                      {res.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>
                      {res.subjectName}
                    </p>

                    {/* Description */}
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                    }}>
                      {res.description || res.contentSnippet}
                    </p>

                    {/* Tags */}
                    {res.tags && res.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {res.tags.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              backgroundColor: 'rgba(255, 244, 222, 0.9)',
                              color: 'var(--text-muted)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(255, 206, 216, 0.6)',
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div style={{
                    borderTop: '1px solid rgba(255, 206, 216, 0.6)',
                    paddingTop: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}>
                    {/* Upvote & Downloads */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => handleUpvote(resId, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: hasUpvoted ? 'var(--palette-rose)' : 'var(--palette-blush)',
                          color: hasUpvoted ? '#8C223A' : 'var(--text-muted)',
                          border: hasUpvoted ? '1px solid #C44563' : '1px solid var(--border-light)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <ThumbsUp size={13} />
                        <span>{res.upvotes ? res.upvotes.length : 0}</span>
                      </button>

                      <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                        {res.downloadsCount || 0} downloads
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreviewDoc(res)}
                        title="Read / Preview Document"
                      >
                        <Eye size={13} /> Preview
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownload(res)}
                        title="Download Note File"
                      >
                        <Download size={13} /> Download
                      </button>
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
          onDownload={handleDownload}
        />
      )}

      {/* macOS Style Sheet Contribute Modal */}
      {isContributeOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            maxWidth: '540px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF4DE 100%)',
            boxShadow: 'var(--mac-window-shadow)',
          }}>
            {/* Window title bar with traffic lights */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 244, 222, 0.85)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="mac-traffic-lights">
                  <span className="traffic-dot red" onClick={() => setIsContributeOpen(false)} />
                  <span className="traffic-dot yellow" />
                  <span className="traffic-dot green" />
                </div>
                <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>
                  Contribute Academic Material
                </h3>
              </div>
              <button
                onClick={() => setIsContributeOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Unit 3 Memory Management Detailed Notes"
                  value={contributeForm.title}
                  onChange={(e) => setContributeForm({ ...contributeForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Subject Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS401"
                    value={contributeForm.subjectCode}
                    onChange={(e) => setContributeForm({ ...contributeForm, subjectCode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-select"
                    value={contributeForm.semester}
                    onChange={(e) => setContributeForm({ ...contributeForm, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Operating Systems"
                  value={contributeForm.subjectName}
                  onChange={(e) => setContributeForm({ ...contributeForm, subjectName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={contributeForm.category}
                  onChange={(e) => setContributeForm({ ...contributeForm, category: e.target.value })}
                >
                  <option value="lecture_note">Lecture Notes</option>
                  <option value="pyq">Previous Year Questions (PYQ)</option>
                  <option value="lab_manual">Lab Manual</option>
                  <option value="cheatsheet">Cheatsheet</option>
                  <option value="syllabus">Syllabus</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Attach File (PDF, DOCX, TXT)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setContributeFile(e.target.files[0])}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Deadlocks, Unit 3, Exam Prep"
                  value={contributeForm.tags}
                  onChange={(e) => setContributeForm({ ...contributeForm, tags: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsContributeOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Uploading...' : 'Publish to Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

