import React, { useState, useRef } from 'react';
import { Icon } from '../../icons';
import { Modal } from '../Modal';

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateVal) {
  if (!dateVal) return 'Recently';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return String(dateVal);
  }
}

export const AdminDocumentCenter = ({
  docs = [],
  uploads = [],
  onBroadcastDoc,
  onReviewDoc,
  onDeleteDoc,
  showToast
}) => {
  // Broadcast modal state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastFile, setBroadcastFile] = useState(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('Policy');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);
  const fileInputRef = useRef(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Delete confirm state
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);

  // Handle opening review modal
  const handleOpenReview = (doc) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.status || 'Approved');
    setReviewNotes(doc.review_notes || '');
    setReviewModalOpen(true);
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setIsSubmittingReview(true);
    try {
      await onReviewDoc(selectedDoc.id, {
        status: reviewStatus,
        review_notes: reviewNotes,
        reviewed_by: 'HR Admin'
      });
      setReviewModalOpen(false);
      setSelectedDoc(null);
    } catch (err) {
      showToast?.('Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle broadcast file selection
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBroadcastFile(file);
    if (!broadcastTitle) {
      setBroadcastTitle(file.name);
    }
  };

  // Submit broadcast
  const handleSubmitBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle && !broadcastFile) {
      showToast?.('Please specify a title or select a file');
      return;
    }
    setIsSubmittingBroadcast(true);
    try {
      const formData = new FormData();
      formData.append('title', broadcastTitle || broadcastFile.name);
      formData.append('category', broadcastCategory);
      formData.append('doc_type', 'broadcast');
      formData.append('uploaded_by', 'HR');
      if (broadcastFile) {
        formData.append('file', broadcastFile);
      }

      await onBroadcastDoc(formData);
      setIsBroadcastOpen(false);
      setBroadcastFile(null);
      setBroadcastTitle('');
      setBroadcastCategory('Policy');
    } catch (err) {
      showToast?.('Error broadcasting document');
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmDoc) return;
    try {
      await onDeleteDoc(deleteConfirmDoc.id);
      setDeleteConfirmDoc(null);
    } catch (err) {
      showToast?.('Error deleting document');
    }
  };

  // Helper getters for backward compatibility if doc is array
  const getDocProps = (d) => {
    if (Array.isArray(d)) {
      return {
        id: d[0],
        title: d[0],
        category: d[1] || 'General',
        uploaded_by: d[2] || 'HR',
        date: d[3] || 'Recently',
        file_path: null,
        status: 'Published',
        isLegacy: true
      };
    }
    return {
      id: d.id,
      title: d.title,
      category: d.category || 'General',
      uploaded_by: d.uploaded_by || 'HR',
      date: formatDate(d.created_at),
      file_path: d.file_path,
      file_size: formatFileSize(d.file_size),
      mime_type: d.mime_type,
      status: d.status || 'Published',
      review_notes: d.review_notes,
      reviewed_by: d.reviewed_by,
      reviewed_at: d.reviewed_at ? formatDate(d.reviewed_at) : null,
      raw: d
    };
  };

  const getUploadProps = (u) => {
    if (Array.isArray(u)) {
      return {
        id: u[0],
        title: u[0],
        uploaded_by: u[1] || 'Employee',
        date: u[2] || 'Recently',
        category: 'Report',
        file_path: null,
        status: 'Pending Review',
        review_notes: null,
        isLegacy: true
      };
    }
    return {
      id: u.id,
      title: u.title,
      uploaded_by: u.uploaded_by || 'Employee',
      date: formatDate(u.created_at),
      category: u.category || 'Report',
      file_path: u.file_path,
      file_size: formatFileSize(u.file_size),
      mime_type: u.mime_type,
      status: u.status || 'Pending Review',
      review_notes: u.review_notes,
      reviewed_by: u.reviewed_by,
      reviewed_at: u.reviewed_at ? formatDate(u.reviewed_at) : null,
      raw: u
    };
  };

  const pendingCount = uploads.filter((u) => {
    const s = Array.isArray(u) ? 'Pending Review' : u.status;
    return s === 'Pending Review';
  }).length;

  return (
    <>
      {/* 1. Broadcast Documents Section */}
      <div className="card pad" style={{ marginBottom: '20px' }}>
        <div className="row" style={{ marginBottom: '16px', alignItems: 'center' }}>
          <div className="grow">
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              Company Broadcast Documents
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              Official policies, guides, and reports distributed to all employees
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => setIsBroadcastOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="plus" size={16} /> Broadcast Document
          </button>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Published By</th>
                <th>Published Date</th>
                <th>Attachment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    No broadcast documents published yet. Click "Broadcast Document" to add one.
                  </td>
                </tr>
              ) : (
                docs.map((item, idx) => {
                  const doc = getDocProps(item);
                  return (
                    <tr key={doc.id || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--p2)' }}><Icon name="doc" size={16} /></span>
                          <b>{doc.title}</b>
                        </div>
                      </td>
                      <td>
                        <span className="pill">{doc.category}</span>
                      </td>
                      <td>{doc.uploaded_by}</td>
                      <td>{doc.date}</td>
                      <td>
                        {doc.file_path ? (
                          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                            {doc.file_size || 'Attached file'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Notice / Text</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {doc.file_path && (
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn ghost"
                              style={{ textDecoration: 'none', padding: '5px 10px', fontSize: '12px' }}
                              title="View or download document"
                            >
                              View / Download
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn ghost"
                            style={{ padding: '5px 8px', color: 'var(--bad)' }}
                            title="Delete document"
                            onClick={() => setDeleteConfirmDoc(doc)}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Employee Uploads Review Section */}
      <div className="card pad">
        <div className="row" style={{ marginBottom: '16px', alignItems: 'center' }}>
          <div className="grow">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Uploaded by Employees
              </h3>
              {pendingCount > 0 && (
                <span className="pill pending" style={{ fontSize: '11px' }}>
                  ⏳ {pendingCount} Pending Review
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              Submissions from team members requiring verification and approval
            </p>
          </div>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Employee</th>
                <th>Category</th>
                <th>Submitted Date</th>
                <th>Review Status</th>
                <th>Admin Notes / Feedback</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    No employee submissions recorded yet.
                  </td>
                </tr>
              ) : (
                uploads.map((item, idx) => {
                  const upload = getUploadProps(item);
                  const statusClass = (upload.status || 'pending').toLowerCase().replace(/\s+/g, '');

                  return (
                    <tr key={upload.id || idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--p)' }}><Icon name="doc" size={16} /></span>
                          <div>
                            <b>{upload.title}</b>
                            {upload.file_size && (
                              <div style={{ fontSize: '11px', color: 'var(--mute)' }}>{upload.file_size}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{upload.uploaded_by}</div>
                      </td>
                      <td>
                        <span className="pill">{upload.category}</span>
                      </td>
                      <td>{upload.date}</td>
                      <td>
                        <span className={`pill ${upload.status}`}>
                          {upload.status === 'Approved' && '✓ '}
                          {upload.status === 'Pending Review' && '⏳ '}
                          {upload.status === 'Needs Revision' && '⚠️ '}
                          {upload.status === 'Rejected' && '✕ '}
                          {upload.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        {upload.review_notes ? (
                          <div
                            style={{
                              fontSize: '12px',
                              background: 'var(--soft)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              lineHeight: '1.4'
                            }}
                          >
                            "{upload.review_notes}"
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>— No notes yet —</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => handleOpenReview(upload.raw || upload)}
                          >
                            Review File
                          </button>
                          <button
                            type="button"
                            className="btn ghost"
                            style={{ padding: '5px 8px', color: 'var(--bad)' }}
                            title="Delete submission"
                            onClick={() => setDeleteConfirmDoc(upload)}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Employee Document"
      >
        {selectedDoc && (
          <form onSubmit={handleSubmitReview} style={{ display: 'grid', gap: '16px' }}>
            {/* File info card */}
            <div
              style={{
                background: 'var(--soft)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="pill">{selectedDoc.category || 'Document'}</span>
                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                  Submitted by <b>{selectedDoc.uploaded_by}</b> • {formatDate(selectedDoc.created_at)}
                </span>
              </div>
              <h4 style={{ margin: '0 0 10px', fontSize: '16px' }}>{selectedDoc.title}</h4>

              {/* View / Download button inside review modal */}
              {selectedDoc.file_path ? (
                <div style={{ marginTop: '10px' }}>
                  <a
                    href={selectedDoc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      background: 'var(--p)',
                      color: '#fff'
                    }}
                  >
                    <Icon name="doc" size={16} /> Open & Inspect Original File
                  </a>
                  {selectedDoc.mime_type?.startsWith('image/') && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img
                        src={selectedDoc.file_path}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '6px',
                          border: '1px solid var(--line)',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--mute)', fontStyle: 'italic' }}>
                  Legacy record / simulated file.
                </div>
              )}
            </div>

            {/* Status selection */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
                Review Decision
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { value: 'Approved', label: '✓ Approved', color: '#16a34a' },
                  { value: 'Needs Revision', label: '⚠️ Needs Revision', color: '#ea580c' },
                  { value: 'Pending Review', label: '⏳ Pending Review', color: '#d97706' },
                  { value: 'Rejected', label: '✕ Rejected', color: '#dc2626' }
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setReviewStatus(s.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: reviewStatus === s.value ? `2px solid ${s.color}` : '1px solid var(--line)',
                      background: reviewStatus === s.value ? 'var(--soft)' : 'var(--surface)',
                      fontWeight: reviewStatus === s.value ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Review feedback notes */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
                Feedback / Notes for Employee
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g., Verified and approved for company records. No further action needed."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setReviewModalOpen(false)}
                disabled={isSubmittingReview}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                disabled={isSubmittingReview}
                style={{ padding: '8px 18px' }}
              >
                {isSubmittingReview ? 'Saving...' : 'Save Review Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Broadcast Document Modal */}
      <Modal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        title="Broadcast Document to Company"
      >
        <form onSubmit={handleSubmitBroadcast} style={{ display: 'grid', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--mute)' }}>
            Publish a document or handbook that will be visible to all employees on their Document Hub.
          </p>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
              Document Title *
            </label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Health & Safety Guidelines 2026.pdf"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--surface)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={broadcastCategory}
              onChange={(e) => setBroadcastCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--surface)'
              }}
            >
              <option value="Policy">Policy</option>
              <option value="Manual">Manual / Handbook</option>
              <option value="Report">Report</option>
              <option value="Announcement">Announcement</option>
              <option value="Compliance">Compliance & Legal</option>
              <option value="Guidelines">Guidelines</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
              Attach File (PDF, DOCX, Image, etc.)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--line)',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg)'
              }}
            >
              <Icon name="doc" size={24} />
              <div style={{ marginTop: '8px', fontWeight: 600 }}>
                {broadcastFile ? broadcastFile.name : 'Click to select file'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '4px' }}>
                {broadcastFile ? `${(broadcastFile.size / 1024).toFixed(1)} KB` : 'Supports PDF, Word, Excel, Images'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hide"
              onChange={handleFilePicked}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setIsBroadcastOpen(false)}
              disabled={isSubmittingBroadcast}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={isSubmittingBroadcast}
              style={{ padding: '8px 18px' }}
            >
              {isSubmittingBroadcast ? 'Publishing...' : 'Publish to All Employees'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmDoc}
        onClose={() => setDeleteConfirmDoc(null)}
        title="Confirm Deletion"
      >
        {deleteConfirmDoc && (
          <div>
            <p style={{ margin: '0 0 16px' }}>
              Are you sure you want to delete <b>{deleteConfirmDoc.title}</b>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setDeleteConfirmDoc(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: 'var(--bad)', color: '#fff' }}
                onClick={handleConfirmDelete}
              >
                Delete Document
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
