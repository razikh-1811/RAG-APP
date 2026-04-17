import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import UploadForm from '../components/UploadForm';
import { uploadAPI } from '../services/api';

const ChatPage = () => {
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await uploadAPI.getDocuments();
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const handleDeleteDoc = async (documentId) => {
    if (!window.confirm('Delete this document and all its chunks?')) return;
    try {
      await uploadAPI.deleteDocument(documentId);
      setDocuments(prev => prev.filter(d => d._id !== documentId));
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fileIcon = (type) => {
    if (type === 'pdf') return '📕';
    if (type === 'docx' || type === 'doc') return '📘';
    return '📄';
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarClosed) }}>
          <button style={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◂' : '▸'}
          </button>

          {sidebarOpen && (
            <div style={styles.sidebarInner} className="animate-in">
              <UploadForm onUploadSuccess={handleUploadSuccess} />

              <div style={styles.docSection}>
                <h3 style={styles.docHeading}>
                  Documents
                  <span style={styles.docCount}>{documents.length}</span>
                </h3>

                {docsLoading ? (
                  <div style={styles.docsLoading}>Loading…</div>
                ) : documents.length === 0 ? (
                  <div style={styles.emptyDocs}>
                    <p style={styles.emptyDocIcon}>📂</p>
                    <p style={styles.emptyDocText}>No documents yet</p>
                    <p style={styles.emptyDocSub}>Upload a file to get started</p>
                  </div>
                ) : (
                  <div style={styles.docList}>
                    {documents.map((doc) => (
                      <div key={doc._id} style={styles.docCard}>
                        <span style={styles.docIcon}>{fileIcon(doc.fileType)}</span>
                        <div style={styles.docInfo}>
                          <p style={styles.docName} title={doc.fileName}>
                            {doc.fileName.length > 24 ? doc.fileName.slice(0, 24) + '…' : doc.fileName}
                          </p>
                          <p style={styles.docMeta}>
                            {doc.totalChunks} chunks · {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoc(doc._id)}
                          style={styles.docDeleteBtn}
                          title="Delete document"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main chat */}
        <main style={styles.main}>
          <ChatBox />
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-base)',
  },
  layout: {
    flex: 1,
    display: 'flex',
    gap: '0',
    overflow: 'hidden',
    height: 'calc(100vh - 60px)',
  },
  sidebar: {
    width: '320px',
    flexShrink: 0,
    borderRight: '1px solid var(--border)',
    position: 'relative',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
  },
  sidebarClosed: {
    width: '40px',
  },
  sidebarToggle: {
    position: 'absolute',
    top: '14px',
    right: '8px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    fontSize: '12px',
  },
  sidebarInner: {
    padding: '16px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  docSection: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    flex: 1,
  },
  docHeading: {
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  docCount: {
    fontSize: '11px',
    background: 'var(--accent-dim)',
    color: 'var(--accent-light)',
    padding: '1px 7px',
    borderRadius: 'var(--radius-full)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 400,
  },
  docsLoading: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    padding: '8px 0',
  },
  emptyDocs: {
    textAlign: 'center',
    padding: '24px 0',
  },
  emptyDocIcon: { fontSize: '28px', marginBottom: '8px' },
  emptyDocText: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' },
  emptyDocSub: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  docCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: 'var(--bg-hover)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    transition: 'border-color 0.2s',
  },
  docIcon: { fontSize: '18px', flexShrink: 0 },
  docInfo: { flex: 1, minWidth: 0 },
  docName: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docMeta: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    marginTop: '2px',
  },
  docDeleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px 4px',
    flexShrink: 0,
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  main: {
    flex: 1,
    padding: '16px',
    overflow: 'hidden',
  },
};

export default ChatPage;
