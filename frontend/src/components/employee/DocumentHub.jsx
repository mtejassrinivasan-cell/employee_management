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

export const DocumentHub = ({
  docs = [],
  uploads = [],
  onUploadFile,
  onDeleteDoc,
  currentUser,
  showToast
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Report');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);
  const [viewNoticeOpen, setViewNoticeOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const fileInputRef = useRef(null);

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile && !uploadTitle) {
      showToast?.('Please select a file to upload');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('category', uploadCategory);
      formData.append('doc_type', 'employee_upload');
      formData.append('uploaded_by', currentUser?.name || 'Employee');
      if (currentUser?.emp_id) {
        formData.append('emp_id', String(currentUser.emp_id));
      }
      if (uploadFile) {
        formData.append('file', uploadFile);
      }

      await onUploadFile(formData);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCategory('Report');
    } catch (err) {
      showToast?.('Error uploading file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDocTarget) return;
    try {
      await onDeleteDoc(deleteDocTarget.id);
      setDeleteDocTarget(null);
    } catch (err) {
      showToast?.('Error removing document');
    }
  };

  // Normalization helpers
  const getDocProps = (d) => {
    if (Array.isArray(d)) {
      return {
        id: d[0],
        title: d[0],
        category: d[1] || 'Policy',
        uploaded_by: d[2] || 'HR',
        date: d[3] || 'Recently',
        file_path: null
      };
    }
    return {
      id: d.id,
      title: d.title,
      category: d.category || 'Policy',
      uploaded_by: d.uploaded_by || 'HR',
      date: formatDate(d.created_at),
      file_path: d.file_path,
      file_size: formatFileSize(d.file_size)
    };
  };

  const getUploadProps = (u) => {
    if (Array.isArray(u)) {
      return {
        id: u[0],
        title: u[0],
        uploaded_by: u[1] || 'Me',
        date: u[2] || 'Recently',
        category: 'Report',
        file_path: null,
        status: 'Pending Review',
        review_notes: null
      };
    }
    return {
      id: u.id,
      title: u.title,
      uploaded_by: u.uploaded_by || 'Me',
      emp_id: u.emp_id,
      date: formatDate(u.created_at),
      category: u.category || 'Report',
      file_path: u.file_path,
      file_size: formatFileSize(u.file_size),
      status: u.status || 'Pending Review',
      review_notes: u.review_notes,
      reviewed_by: u.reviewed_by
    };
  };

  // Filter employee uploads: if current user is set, match employee id or name, or show all if none match
  const myUploads = uploads.filter((u) => {
    if (!currentUser) return true;
    const item = getUploadProps(u);
    if (currentUser.emp_id && item.emp_id && Number(currentUser.emp_id) === Number(item.emp_id)) {
      return true;
    }
    if (item.uploaded_by && (item.uploaded_by === currentUser.name || item.uploaded_by === 'Me')) {
      return true;
    }
    return false;
  });

  const displayUploads = myUploads.length > 0 ? myUploads : uploads;

  return (
    <>
      {/* 1. Shared by HR Section */}
      <div className="card pad" style={{ marginBottom: '20px' }}>
        <div className="row" style={{ marginBottom: '14px', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              Company Broadcast Documents (Shared by HR)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              Official handbooks, guidelines, and policies posted by management
            </p>
          </div>
        </div>

        <div className="grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>No broadcast documents available.</div>
          ) : (
            docs.map((item, idx) => {
              const doc = getDocProps(item);
              return (
                <div key={doc.id || idx} className="doc-card" style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '12px', background: 'var(--soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--p2)' }}><Icon name="doc" size={16} /></span>
                    <b>{doc.title}</b>
                  </div>
                  <div style={{ marginBottom: '4px' }}><span className="pill">{doc.category}</span></div>
                  <div style={{ marginBottom: '4px' }}>{doc.uploaded_by}</div>
                  <div style={{ marginBottom: '8px' }}>{doc.date}</div>
                  <div style={{ textAlign: 'right' }}>
                    {doc.file_path ? (
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '12px' }}>
                        View / Download
                      </a>
                    ) : (
                      <button type="button" className="btn ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setSelectedNotice(doc); setViewNoticeOpen(true); }}>
                        Read Notice
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. My Uploaded Files Section */}
      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px', alignItems: 'center' }}>
          <div className="grow">
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              My Uploaded Documents
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              Submit status reports, medical proof, or project files for HR/Admin review
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => setIsUploadOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="plus" size={16} /> Upload Document
          </button>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Submitted Date</th>
                <th>Review Status</th>
                <th>HR / Admin Feedback</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUploads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    You have not uploaded any documents yet. Click "Upload Document" to submit a file.
                  </td>
                </tr>
              ) : (
                displayUploads.map((item, idx) => {
                  const upload = getUploadProps(item);
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
                              padding: '5px 8px',
                              borderRadius: '6px',
                              lineHeight: '1.4',
                              color: upload.status === 'Approved' ? 'var(--ok)' : 'var(--ink)'
                            }}
                          >
                            💬 <b>HR Feedback:</b> "{upload.review_notes}"
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                            {upload.status === 'Approved' ? 'Verified by HR' : 'Awaiting review'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {upload.file_path && (
                            <a
                              href={upload.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn ghost"
                              style={{ textDecoration: 'none', padding: '5px 10px', fontSize: '12px' }}
                              title="Download file"
                            >
                              Download
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn ghost"
                            style={{ padding: '5px 8px', color: 'var(--bad)' }}
                            title="Withdraw file"
                            onClick={() => setDeleteDocTarget(upload)}
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

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document for HR Review"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--mute)' }}>
            Upload reports, medical bills, certificates, or task deliverables. Your submission will appear in the HR Admin review queue.
          </p>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
              Select File *
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
                {uploadFile ? uploadFile.name : 'Click to choose file'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '4px' }}>
                {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB` : 'Supports PDF, Word, Excel, PNG, JPG, Text'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              required
              className="hide"
              onChange={handleFilePicked}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
              Document Title
            </label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Weekly Sprint Status Report.pdf"
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
              Document Category
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--surface)'
              }}
            >
              <option value="Report">Status Report</option>
              <option value="Medical">Medical / Sick Leave Proof</option>
              <option value="Certificate">Certificate / Training</option>
              <option value="Expenses">Expense Receipt</option>
              <option value="ID Verification">ID / Identity Document</option>
              <option value="Project Deliverable">Project Deliverable</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setIsUploadOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
              style={{ padding: '8px 18px' }}
            >
              {isSubmitting ? 'Uploading...' : 'Submit to HR'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Withdraw Confirmation Modal */}
      <Modal
        isOpen={!!deleteDocTarget}
        onClose={() => setDeleteDocTarget(null)}
        title="Withdraw Submission"
      >
        {deleteDocTarget && (
          <div>
            <p style={{ margin: '0 0 16px' }}>
              Are you sure you want to remove <b>{deleteDocTarget.title}</b>? This will delete the file from the HR review queue.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setDeleteDocTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: 'var(--bad)', color: '#fff' }}
                onClick={handleDeleteConfirm}
              >
                Withdraw File
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Notice Modal */}
      <Modal
        isOpen={viewNoticeOpen}
        onClose={() => {
          setViewNoticeOpen(false);
          setSelectedNotice(null);
        }}
        title={selectedNotice?.title || 'Notice'}
      >
        <div style={{ whiteSpace: 'pre-wrap', padding: '12px' }}>
          {selectedNotice?.content || 'No additional content available.'}
        </div>
      </Modal>
    </>
  );
};
