import React, { useState } from 'react';

const Message = ({ message }) => {
  const { role, content, chunks, loading } = message;
  const isUser = role === 'user';
  const [showChunks, setShowChunks] = useState(false);

  if (loading) {
    return (
      <div style={{ ...styles.wrapper, justifyContent: 'flex-start' }}>
        <div style={styles.aiAvatar}>⬡</div>
        <div style={{ ...styles.bubble, ...styles.aiBubble }}>
          <div style={styles.typingDots}>
            <span style={{ ...styles.dot, animationDelay: '0ms' }} />
            <span style={{ ...styles.dot, animationDelay: '160ms' }} />
            <span style={{ ...styles.dot, animationDelay: '320ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrapper, justifyContent: isUser ? 'flex-end' : 'flex-start' }} className="animate-in">
      {!isUser && <div style={styles.aiAvatar}>⬡</div>}

      <div style={{ maxWidth: '72%' }}>
        <div style={{ ...styles.bubble, ...(isUser ? styles.userBubble : styles.aiBubble) }}>
          <p style={styles.text}>{content}</p>
        </div>

        {/* Source chunks toggle */}
        {!isUser && chunks && chunks.length > 0 && (
          <div style={styles.chunksSection}>
            <button onClick={() => setShowChunks(!showChunks)} style={styles.chunksToggle}>
              <span>{showChunks ? '▴' : '▾'}</span>
              {chunks.length} source{chunks.length > 1 ? 's' : ''} used
            </button>

            {showChunks && (
              <div style={styles.chunksList}>
                {chunks.map((chunk, i) => (
                  <div key={i} style={styles.chunkCard}>
                    <div style={styles.chunkHeader}>
                      <span style={styles.chunkFile}>
                        📄 {chunk.fileName || 'Document'}
                      </span>
                      <span style={styles.chunkScore}>
                        {(chunk.similarityScore * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p style={styles.chunkText}>{chunk.content.slice(0, 220)}{chunk.content.length > 220 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div style={styles.userAvatar}>U</div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    marginBottom: '16px',
  },
  aiAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
    filter: 'drop-shadow(0 0 6px var(--accent-glow))',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--border)',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    flexShrink: 0,
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    lineHeight: 1.6,
  },
  userBubble: {
    background: 'var(--accent)',
    color: '#fff',
    borderBottomRightRadius: '4px',
    boxShadow: 'var(--shadow-accent)',
  },
  aiBubble: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderBottomLeftRadius: '4px',
  },
  text: {
    fontSize: '14px',
    color: 'inherit',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
  },
  typingDots: {
    display: 'flex',
    gap: '5px',
    padding: '4px 0',
    alignItems: 'center',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'inline-block',
    animation: 'bounce 1.2s infinite ease-in-out',
  },
  chunksSection: {
    marginTop: '6px',
  },
  chunksToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '2px 4px',
    fontFamily: 'var(--font-mono)',
    transition: 'color 0.2s',
  },
  chunksList: {
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  chunkCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
  },
  chunkHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  chunkFile: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  chunkScore: {
    fontSize: '11px',
    color: 'var(--success)',
    fontFamily: 'var(--font-mono)',
    background: 'var(--success-dim)',
    padding: '1px 6px',
    borderRadius: 'var(--radius-full)',
  },
  chunkText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
  },
};

// Inject bounce animation
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }
`;
document.head.appendChild(styleEl);

export default Message;
