import React from 'react';
import useSocket from '../hooks/useSocket';

// Import our 3 core pillar components
import TriageForm from './TriageForm';
import PatientQueue from './PatientQueue';
import ShiftReport from './ShiftReport';

// Ensure the global CSS is imported so we can use the glass-panel class
import '../App.css'; 

const Dashboard = () => {
  // Hook into our global WebSocket state
  const { socket, isConnected, queue, totalWaiting } = useSocket();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* --- DASHBOARD HEADER & STATUS BAR --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        padding: '0 8px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Active Triage Sector
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>
            Total Patients Waiting: <strong style={{ color: '#38bdf8', fontSize: '16px' }}>{totalWaiting}</strong>
          </p>
        </div>

        {/* Premium Dark-Mode Connection Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.6)', // Dark glass
          backdropFilter: 'blur(10px)',
          padding: '10px 20px',
          borderRadius: '30px',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          boxShadow: isConnected ? '0 0 20px rgba(16, 185, 129, 0.1)' : '0 0 20px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 12px #10b981' : '0 0 12px #ef4444',
            animation: isConnected ? 'pulse-glow 2s infinite' : 'none'
          }}></div>
          <span style={{ 
            color: isConnected ? '#10b981' : '#ef4444', 
            fontWeight: '700', 
            fontSize: '12px',
            letterSpacing: '1px'
          }}>
            {isConnected ? 'SYSTEM SECURE' : 'CONNECTION LOST'}
          </span>
        </div>
      </div>

      {/* --- 3-COLUMN COMMAND CENTER GRID --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '27% 46% 27%', // Optimal split for content
        gap: '24px', 
        flex: 1, 
        minHeight: 0 // Crucial CSS trick to allow columns to scroll independently
      }}>
        
        {/* LEFT: Intake Form (Using glass-panel class from App.css) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <TriageForm socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* CENTER: Action Queue (The Max-Heap) */}
        {/* We add a subtle blue border to the center panel to make it the focal point */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.02)'
        }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <PatientQueue queue={queue} socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* RIGHT: Local History Report */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <ShiftReport socket={socket} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;