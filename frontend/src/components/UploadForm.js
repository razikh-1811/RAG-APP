import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['pdf', 'docx', 'doc', 'txt', 'md'];
    const ext = f.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await uploadAPI.upload(formData);
      setResult(res.data.data);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Upload Document</h3>
      <p style={styles.sub}>PDF, DOCX, or TXT — up to 50MB</p>

      {/* Drop zone */}
      <div
        style={{
          ...styles.dropzone,
          ...(dragOver ? styles.dropzoneActive : {}),
          ...(file ? styles.dropzoneFilled : {}),
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {file ? (
          <div style={styles.fileInfo}>
            <span style={styles.fileIcon}>
              {file.name.endsWith('.pdf') ? '📕' : file.name.endsWith('.docx') || file.name.endsWith('.doc') ? '📘' : '📄'}
            </span>
            <div>
              <p style={styles.fileName}>{file.name}</p>
              <p style={styles.fileSize}>{formatSize(file.size)}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={styles.removeBtn}>✕</button>
          </div>
        ) : (
          <div style={styles.placeholder}>
            <div style={styles.uploadIcon}>⬆</div>
            <p style={styles.dropText}>Drop file here or <span style={styles.browse}>browse</span></p>
          </div>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.success}>
          <span style={styles.successIcon}>✓</span>
          <div>
            <p style={styles.successTitle}>Successfully processed!</p>
            <p style={styles.successDetail}>{result.totalChunks} chunks created from {result.fileName}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{
          ...styles.uploadBtn,
          ...((!file || uploading) ? styles.uploadBtnDisabled : {}),
        }}
      >
        {uploading ? (
          <span style={styles.spinnerRow}>
            <span style={styles.spinner} /> Processing...
          </span>
        ) : 'Upload & Process'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  sub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '14px',
    fontFamily: 'var(--font-mono)',
  },
  dropzone: {
    border: '1.5px dashed var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '12px',
  },
  dropzoneActive: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-dim)',
  },
  dropzoneFilled: {
    borderStyle: 'solid',
    borderColor: 'var(--border-bright)',
    cursor: 'default',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  uploadIcon: {
    fontSize: '24px',
    color: 'var(--text-muted)',
  },
  dropText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
  },
  browse: {
    color: 'var(--accent-light)',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  fileIcon: { fontSize: '24px' },
  fileName: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: 500,
    wordBreak: 'break-all',
  },
  fileSize: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  removeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
    flexShrink: 0,
  },
  error: {
    fontSize: '12px',
    color: 'var(--error)',
    background: 'var(--error-dim)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '8px',
  },
  success: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--success-dim)',
    border: '1px solid rgba(74,222,128,0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    marginBottom: '10px',
  },
  successIcon: {
    color: 'var(--success)',
    fontSize: '16px',
    fontWeight: 700,
    flexShrink: 0,
  },
  successTitle: {
    fontSize: '13px',
    color: 'var(--success)',
    fontWeight: 500,
  },
  successDetail: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  uploadBtn: {
    width: '100%',
    padding: '10px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  uploadBtnDisabled: {
    background: 'var(--border)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  },
  spinnerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

export default UploadForm;
