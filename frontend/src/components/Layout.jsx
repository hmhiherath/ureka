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
      padding: '20px', // This creates the "safe zone" for your borders
      boxSizing: 'border-box',
      overflow: 'hidden' 
    }}>
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;