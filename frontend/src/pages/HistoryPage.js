import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { historyAPI } from '../services/api';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [pagination, setPagination] = useState({});
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await historyAPI.getHistory(page);
      setHistory(res.data.data.history);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await historyAPI.deleteEntry(id);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch {
      alert('Failed to delete entry.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all search history? This cannot be undone.')) return;
    setClearing(true);
    try {
      await historyAPI.clearAll();
      setHistory([]);
    } catch {
      alert('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Search History</h1>
            <p style={styles.sub}>
              {pagination.total || 0} conversation{pagination.total !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => navigate('/chat')} style={styles.backBtn}>
              ← Back to Chat
            </button>
            {history.length > 0 && (
              <button onClick={handleClearAll} disabled={clearing} style={styles.clearBtn}>
                {clearing ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner} />
            <p>Loading history…</p>
          </div>
        ) : history.length === 0 ? (
          <div style={styles.emptyState} className="animate-in">
            <div style={styles.emptyIcon}>◷</div>
            <h2 style={styles.emptyTitle}>No history yet</h2>
            <p style={styles.emptySub}>Your Q&A sessions will appear here after you use the chat.</p>
            <button onClick={() => navigate('/chat')} style={styles.goToChat}>
              Go to Chat →
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {history.map((entry) => (
              <div
                key={entry._id}
                style={styles.card}
                className="animate-in"
                onClick={() => setExpandedId(expandedId === entry._id ? null : entry._id)}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <span style={styles.questionIcon}>?</span>
                    <p style={styles.question}>{entry.question}</p>
                  </div>
                  <div style={styles.cardHeaderRight}>
                    <span style={styles.dateLabel}>{formatDate(entry.createdAt)}</span>
                    {entry.retrievedChunks?.length > 0 && (
                      <span style={styles.sourceBadge}>
                        {entry.retrievedChunks.length} sources
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(entry._id, e)}
                      style={styles.deleteBtn}
                      title="Delete"
                    >✕</button>
                  </div>
                </div>

                {expandedId === entry._id && (
                  <div style={styles.cardExpanded} className="animate-in">
                    <div style={styles.answerSection}>
                      <span style={styles.sectionLabel}>Answer</span>
                      <p style={styles.answerText}>{entry.answer}</p>
                    </div>

                    {entry.retrievedChunks?.length > 0 && (
                      <div style={styles.chunksSection}>
                        <span style={styles.sectionLabel}>Sources Used</span>
                        <div style={styles.chunksList}>
                          {entry.retrievedChunks.map((chunk, i) => (
                            <div key={i} style={styles.chunkItem}>
                              <div style={styles.chunkMeta}>
                                <span style={styles.chunkFile}>📄 {chunk.fileName || 'Document'}</span>
                                <span style={styles.chunkScore}>
                                  {(chunk.similarityScore * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p style={styles.chunkContent}>
                                {chunk.content.slice(0, 200)}{chunk.content.length > 200 ? '…' : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/chat');
                      }}
                      style={styles.reloadBtn}
                    >
                      Ask again in Chat →
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchHistory(p)}
                    style={{
                      ...styles.pageBtn,
                      ...(p === pagination.page ? styles.pageBtnActive : {}),
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-base)' },
  container: { maxWidth: '860px', margin: '0 auto', padding: '32px 24px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
  },
  heading: { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' },
  sub: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  backBtn: { padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  clearBtn: { padding: '8px 16px', background: 'var(--error-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-full)', color: 'var(--error)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' },
  loadingState: { textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  loadingSpinner: { width: '28px', height: '28px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  emptyState: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: '48px', color: 'var(--border-bright)', marginBottom: '16px' },
  emptyTitle: { fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', fontWeight: 300 },
  goToChat: { padding: '10px 24px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-body)' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '16px 18px' },
  cardHeaderLeft: { display: 'flex', gap: '10px', flex: 1, alignItems: 'flex-start' },
  questionIcon: { width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-display)', lineHeight: '22px', textAlign: 'center' },
  question: { fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 },
  cardHeaderRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  dateLabel: { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' },
  sourceBadge: { fontSize: '11px', color: 'var(--accent-light)', background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' },
  deleteBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: '4px', flexShrink: 0 },
  cardExpanded: { padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: '16px' },
  answerSection: { marginBottom: '16px' },
  sectionLabel: { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' },
  answerText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 300, whiteSpace: 'pre-wrap' },
  chunksSection: { marginBottom: '14px' },
  chunksList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  chunkItem: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px' },
  chunkMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  chunkFile: { fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
  chunkScore: { fontSize: '11px', color: 'var(--success)', background: 'var(--success-dim)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)' },
  chunkContent: { fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 },
  reloadBtn: { marginTop: '4px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--accent-light)', fontSize: '12px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' },
  pagination: { display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' },
  pageBtn: { width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-mono)' },
  pageBtnActive: { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent-light)' },
};

export default HistoryPage;
