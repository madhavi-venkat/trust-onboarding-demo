import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const DOC_TYPES = [
  { value: 'TRUST_DEED',        label: 'Trust Deed' },
  { value: 'ID_VERIFICATION',   label: 'ID Verification' },
  { value: 'REGISTRATION_CERT', label: 'Registration Certificate' },
  { value: 'OTHER',             label: 'Other' },
];

const TYPE_LABEL = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d.label]));

function fileIcon(name) {
  const ext = name?.split('.').pop()?.toLowerCase();
  const map = { pdf: '📄', doc: '📝', docx: '📝', jpg: '🖼', jpeg: '🖼', png: '🖼', xlsx: '📊', csv: '📊' };
  return map[ext] || '📎';
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DocumentsSection({ applicationId }) {
  const [documents,    setDocuments]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [docType,      setDocType]      = useState('TRUST_DEED');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.getDocuments(applicationId)
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) { setUploadError('Please select a file.'); return; }

    setUploading(true);
    setUploadError(null);
    try {
      const doc = await api.uploadDocument(applicationId, selectedFile, docType);
      setDocuments((p) => [doc, ...p]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setUploadError(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    try {
      await api.deleteDocument(docId);
      setDocuments((p) => p.filter((d) => d.id !== docId));
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card">
      <h2>Documents</h2>

      {/* ── Upload area ───────────────────────────────────────────────────── */}
      <div className="upload-area">
        <div className="upload-row">
          <select className="input" style={{ width: 200, flexShrink: 0 }}
            value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <label className="file-picker">
            <input ref={fileInputRef} type="file" style={{ display: 'none' }}
              onChange={handleFileChange} />
            <span className="file-picker-label">
              {selectedFile ? selectedFile.name : 'Choose file…'}
            </span>
          </label>

          <button className="btn-primary" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        {uploadError && <p className="error-msg" style={{ marginTop: 8 }}>{uploadError}</p>}

        {selectedFile && (
          <p style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
            {selectedFile.name} &nbsp;·&nbsp; {formatBytes(selectedFile.size)}
          </p>
        )}
      </div>

      {/* ── Document list ─────────────────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 16 }}>Loading documents…</p>
      ) : documents.length === 0 ? (
        <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 16 }}>No documents uploaded yet.</p>
      ) : (
        <div style={{ marginTop: 16 }}>
          {documents.map((doc) => (
            <div key={doc.id} className="doc-row">
              <span className="doc-icon">{fileIcon(doc.fileName)}</span>
              <div className="doc-info">
                <div className="doc-name">{doc.fileName}</div>
                <div className="doc-meta">
                  {TYPE_LABEL[doc.documentType] ?? doc.documentType}
                  {doc.uploadedAt && (
                    <> &nbsp;·&nbsp; {new Date(doc.uploadedAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</>
                  )}
                </div>
              </div>
              <div className="doc-actions">
                <a href={api.viewUrl(doc.id)} target="_blank" rel="noreferrer"
                  className="btn-link" style={{ fontSize: 13 }}>
                  View
                </a>
                <a href={api.downloadUrl(doc.id)} download={doc.fileName}
                  className="btn-link" style={{ fontSize: 13 }}>
                  Download
                </a>
                <button className="btn-remove"
                  disabled={deletingId === doc.id}
                  onClick={() => handleDelete(doc.id)}>
                  {deletingId === doc.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
