import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      background: 'radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%)',
      height: '100vh', 
      width: '100vw', 
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden' 
    }}>
      <main style={{ 
        flex: 1, 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%', // Changed from 100vh to 100%
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;