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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100%',
      maxWidth: '100vw', // Prevents horizontal spill
      padding: '20px', 
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: '#020617' // Matches body background
    }}>
      
      {/* --- DASHBOARD HEADER & STATUS BAR --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '0 4px',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Active Triage Sector
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
            Total Patients Waiting: <strong style={{ color: '#38bdf8', fontSize: '15px' }}>{totalWaiting}</strong>
          </p>
        </div>

        {/* Connection Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.8)', 
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '30px',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 12px #10b981' : '0 0 12px #ef4444',
          }}></div>
          <span style={{ 
            color: isConnected ? '#10b981' : '#ef4444', 
            fontWeight: '700', 
            fontSize: '11px',
            letterSpacing: '1px'
          }}>
            {isConnected ? 'SYSTEM SECURE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* --- 3-COLUMN COMMAND CENTER GRID --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1.8fr 1fr', // Ratio-based sizing instead of fixed %
        gap: '20px', 
        flex: 1, 
        minHeight: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* LEFT: Intake Form */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <div style={{ overflowY: 'auto', padding: '20px', height: '100%' }}>
            <TriageForm socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* CENTER: Action Queue */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: 'inset 0 0 20px rgba(56, 189, 248, 0.05)'
        }}>
          <div style={{ overflowY: 'auto', padding: '20px', height: '100%' }}>
            <PatientQueue queue={queue} socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* RIGHT: Mission Log (Shift Report) */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)', // Visible right border
          marginRight: '2px' // Small buffer to ensure border doesn't clip browser edge
        }}>
          <div style={{ overflowY: 'auto', padding: '20px', height: '100%' }}>
            <ShiftReport socket={socket} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;