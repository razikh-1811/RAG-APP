import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/chat" style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>RAG Assistant</span>
        </Link>

        {/* Nav links */}
        <div style={styles.links}>
          <Link to="/chat" style={{ ...styles.link, ...(isActive('/chat') ? styles.linkActive : {}) }}>
            <span style={styles.linkIcon}>◈</span> Chat
          </Link>
          <Link to="/history" style={{ ...styles.link, ...(isActive('/history') ? styles.linkActive : {}) }}>
            <span style={styles.linkIcon}>◷</span> History
          </Link>
        </div>

        {/* User */}
        <div style={styles.userArea}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={styles.userName}>{user?.name}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    marginRight: 'auto',
  },
  logoIcon: {
    fontSize: '22px',
    color: 'var(--accent)',
    filter: 'drop-shadow(0 0 8px var(--accent))',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    gap: '4px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
  linkActive: {
    color: 'var(--accent-light)',
    background: 'var(--accent-dim)',
  },
  linkIcon: {
    fontSize: '12px',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    color: 'var(--accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
  },
  userName: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: 400,
  },
  logoutBtn: {
    padding: '5px 12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
};

export default Navbar;
