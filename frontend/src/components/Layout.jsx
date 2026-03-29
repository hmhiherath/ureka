import React from 'react';
// Ensure App.css is imported somewhere in your app (usually in index.js or App.js)
// If not, you can import it here: import '../App.css';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      /* The background color is now handled by App.css (body tag), 
         but we add a subtle radial gradient here to create a "spotlight" effect 
         in the center of the command center */
      background: 'radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%)',
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex',
      flexDirection: 'column',
      margin: 0,
      padding: 0,
      overflow: 'hidden' 
    }}>
      {/* Main Content Viewport
        The 24px padding acts as the "bezel" of the monitor, 
        keeping the glass panels away from the absolute edges of the screen.
      */}
      <main style={{ 
        flex: 1, 
        padding: '24px', 
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