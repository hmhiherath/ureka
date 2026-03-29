import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import LiveClock from './LiveClock';

const Layout = () => {
  // Inline CSS for animations
  const animationStyles = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
      100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
    }
    .nav-link { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .nav-link:hover { transform: translateX(8px); background: rgba(255,255,255,0.05); }
  `;

  const sidebarStyle = {
    width: '260px',
    height: '100vh',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    color: '#fff',
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    zIndex: 100
  };

  const navLinkStyle = ({ isActive }) => ({
    padding: '16px 28px',
    textDecoration: 'none',
    color: isActive ? '#38bdf8' : '#94a3b8',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    display: 'flex',
    alignItems: 'center',
    borderLeft: isActive ? '4px solid #38bdf8' : '4px solid transparent',
    background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%)' : 'transparent',
    animation: isActive ? 'pulse 2s infinite' : 'none'
  });

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{animationStyles}</style>
      
      <div style={sidebarStyle}>
        <div style={{ padding: '40px 28px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            margin: 0, 
            fontWeight: '900', 
            letterSpacing: '-1px', 
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>UREKA</h1>
          <div style={{ width: '30px', height: '4px', background: '#38bdf8', marginTop: '8px', borderRadius: '2px' }}></div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/admin" end className="nav-link" style={navLinkStyle}>OVERVIEW</NavLink>
          <NavLink to="/admin/queue" className="nav-link" style={navLinkStyle}>LIVE QUEUE</NavLink>
          <NavLink to="/admin/triage" className="nav-link" style={navLinkStyle}>NEW INTAKE</NavLink>
          <NavLink to="/admin/reports" className="nav-link" style={navLinkStyle}>SHIFT REPORT</NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '30px 28px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <small style={{ color: '#475569', fontSize: '10px', fontWeight: 'bold' }}>SECURE NODE: ACTIVE</small>
        </div>
      </div>

      <div style={{ marginLeft: '260px', flex: 1 }}>
        <header style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(10px)',
          padding: '20px 48px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          borderBottom: '1px solid #e2e8f0',
          zIndex: 90
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>UNIT OPERATIONS COMMAND</span>
          <LiveClock />
        </header>
        
        <main style={{ padding: '48px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
