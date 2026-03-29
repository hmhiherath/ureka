import React from 'react';
import LiveClock from './LiveClock';

const Layout = ({ children }) => {
  // Inline CSS for animations
  const animationStyles = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
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

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{animationStyles}</style>
      
      {/* Sidebar Branding */}
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
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '16px', fontWeight: '500', letterSpacing: '0.5px' }}>
            Emergency Room<br/>Command Center
          </p>
        </div>
        
        {/* Node Status */}
        <div style={{ marginTop: 'auto', padding: '30px 28px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#10b981', 
              animation: 'pulse 2s infinite' 
            }}></div>
            <small style={{ color: '#94a3b8', fontSize: '10px', fontWeight: '800', letterSpacing: '1px' }}>
              SECURE NODE: ACTIVE
            </small>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <header style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(10px)',
          padding: '20px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 90
        }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', letterSpacing: '1px' }}>
            UNIT OPERATIONS COMMAND
          </span>
          <LiveClock />
        </header>
        
        {/* The Dashboard Component injects here */}
        <main style={{ padding: '24px', flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;