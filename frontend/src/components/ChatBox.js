import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import { askAPI } from '../services/api';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm DocuMind. Upload a document using the panel on the left, then ask me anything about it. I'll search through your documents and give you precise answers.",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(5);
  const [threshold, setThreshold] = useState(0.3);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: q };
    const loadingMsg = { id: 'loading', role: 'assistant', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAPI.ask(q, topK, threshold);
      const { answer, retrievedChunks } = res.data.data;

      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: answer,
          chunks: retrievedChunks,
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Error: ${err.response?.data?.message || 'Failed to get answer. Please try again.'}`,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Chat cleared. Ask me anything about your uploaded documents!",
    }]);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>◈</span>
          <span style={styles.headerTitle}>Chat</span>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowSettings(!showSettings)} style={styles.headerBtn} title="Search settings">
            ⚙
          </button>
          <button onClick={clearChat} style={styles.headerBtn} title="Clear chat">
            ↺
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={styles.settings} className="animate-in">
          <div style={styles.settingRow}>
            <label style={styles.settingLabel}>
              Results (topK): <span style={styles.settingVal}>{topK}</span>
            </label>
            <input
              type="range" min="1" max="10" value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
          <div style={styles.settingRow}>
            <label style={styles.settingLabel}>
              Min similarity: <span style={styles.settingVal}>{(threshold * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range" min="0" max="0.9" step="0.05" value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents…"
            disabled={loading}
            rows={1}
            style={styles.textarea}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              ...styles.sendBtn,
              ...(!input.trim() || loading ? styles.sendBtnDisabled : {}),
            }}
          >
            {loading ? <span style={styles.miniSpinner} /> : '↑'}
          </button>
        </div>
        <p style={styles.hint}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerIcon: {
    color: 'var(--accent)',
    fontSize: '14px',
  },
  headerTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--text-primary)',
  },
  headerActions: {
    display: 'flex',
    gap: '4px',
  },
  headerBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    transition: 'color 0.2s',
  },
  settings: {
    padding: '12px 18px',
    background: 'var(--bg-elevated)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '140px',
  },
  settingLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  settingVal: {
    color: 'var(--accent-light)',
  },
  slider: {
    width: '100%',
    accentColor: 'var(--accent)',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 18px',
  },
  inputArea: {
    padding: '12px 18px 14px',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
  },
  inputWrapper: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    padding: '10px 14px',
    resize: 'none',
    lineHeight: 1.5,
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    maxHeight: '140px',
    overflowY: 'auto',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-accent)',
  },
  sendBtnDisabled: {
    background: 'var(--border)',
    color: 'var(--text-muted)',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  miniSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  hint: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    fontFamily: 'var(--font-mono)',
  },
};

export default ChatBox;
