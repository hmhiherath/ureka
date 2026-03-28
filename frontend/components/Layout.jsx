import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="admin-layout">
      {/* --- SIDEBAR NAVIGATION --- 
        This remains on screen for all /admin/* routes.
      */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ER Triage System</h2>
          <span className="badge">Staff Portal</span>
        </div>

        <nav className="sidebar-nav">
          {/* NavLink automatically adds the class "active" when the URL matches.
            Using 'end' on the home route prevents it from highlighting 
            when sub-routes (like /admin/queue) are active.
          */}
          <NavLink to="/admin" end className="nav-item">
            🏠 Overview Dashboard
          </NavLink>
          
          <NavLink to="/admin/queue" className="nav-item">
            📊 Live Triage Queue
          </NavLink>
          
          <NavLink to="/admin/triage" className="nav-item">
            ➕ New Intake (Triage)
          </NavLink>
          
          <NavLink to="/admin/reports" className="nav-item">
            📝 Shift Report
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p>Logged in as:</p>
            <strong>Triage Nurse (Station 1)</strong>
          </div>
          {/* In a production app, this would clear JWT auth tokens */}
          <button className="logout-btn">Log Out</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA ---
        The <Outlet /> acts as the placeholder. React Router swaps the 
        Dashboard, TriageForm, PatientQueue, or ShiftReport in and out right here.
      */}
      <main className="main-content">
        <header className="top-header">
          <h1>Triage Operations Dashboard</h1>
          <div className="system-status">
            <span className="status-dot green"></span> System Online & Synced
          </div>
        </header>
        
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;