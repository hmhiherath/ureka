import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      background: '#f8fafc', 
      minHeight: '100vh', 
      width: '100vw', 
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden' // Locks the body so only the 3 columns can scroll
    }}>
      {/* Main Content Viewport - Now takes up the absolute entire screen */}
      <main style={{ 
        flex: 1, 
        padding: '24px', // Keeps a nice breathing room around the edges of your 3 panels
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;