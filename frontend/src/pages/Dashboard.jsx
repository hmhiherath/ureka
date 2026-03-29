import React from 'react';
import useSocket from '../hooks/useSocket';

// Import our 3 core pillar components
import TriageForm from './TriageForm';
import PatientQueue from './PatientQueue';
import ShiftReport from './ShiftReport';

const Dashboard = () => {
  // 1. Hook into our global WebSocket state
  const { socket, isConnected, queue, totalWaiting } = useSocket();

  // 2. Common styles for our scrollable columns
  const columnStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Contain the inner scroll
    border: '1px solid #e2e8f0'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* --- DASHBOARD HEADER & STATUS BAR --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '0 8px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '800' }}>
            Active Triage Sector
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Total Patients Waiting: <strong style={{ color: '#0f172a' }}>{totalWaiting}</strong>
          </p>
        </div>

        {/* Dynamic Connection Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isConnected ? '#ecfdf5' : '#fef2f2',
          padding: '8px 16px',
          borderRadius: '20px',
          border: `1px solid ${isConnected ? '#a7f3d0' : '#fecaca'}`
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
          }}></div>
          <span style={{ 
            color: isConnected ? '#065f46' : '#991b1b', 
            fontWeight: '600', 
            fontSize: '13px',
            letterSpacing: '0.5px'
          }}>
            {isConnected ? 'SYSTEM ONLINE' : 'CONNECTION LOST'}
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
        
        {/* LEFT: Intake Form */}
        <div style={columnStyle}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <TriageForm socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* CENTER: Action Queue (The Max-Heap) */}
        <div style={{ ...columnStyle, border: '2px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%', background: '#f8fafc' }}>
            <PatientQueue queue={queue} socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* RIGHT: Local History Report */}
        <div style={columnStyle}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <ShiftReport socket={socket} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;