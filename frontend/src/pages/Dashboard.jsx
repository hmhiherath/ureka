import React from 'react';
import useSocket from '../hooks/useSocket';
import TriageForm from './TriageForm';
import PatientQueue from './PatientQueue';
import ShiftReport from './ShiftReport';
import '../App.css'; 

const Dashboard = () => {
  const { socket, isConnected, queue, totalWaiting } = useSocket();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', // Occupy only the space provided by Layout
      width: '100%',
      gap: '20px' 
    }}>
      
      {/* --- DASHBOARD HEADER --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexShrink: 0 
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '28px', fontWeight: '900' }}>
            Active Triage Sector
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Total Patients Waiting: <strong style={{ color: '#38bdf8' }}>{totalWaiting}</strong>
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(10px)',
          padding: '10px 20px',
          borderRadius: '30px',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444'
          }}></div>
          <span style={{ color: isConnected ? '#10b981' : '#ef4444', fontWeight: '700', fontSize: '12px' }}>
            {isConnected ? 'SYSTEM SECURE' : 'CONNECTION LOST'}
          </span>
        </div>
      </div>

      {/* --- 3-COLUMN GRID --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '27% 46% 27%', 
        gap: '20px', 
        flex: 1, 
        minHeight: 0 
      }}>
        
        {/* LEFT */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)' 
        }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <TriageForm socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* CENTER */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.4)'
        }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <PatientQueue queue={queue} socket={socket} disabled={!isConnected} />
          </div>
        </div>

        {/* RIGHT - Mission Log */}
        <div className="glass-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)' // Fully visible border
        }}>
          <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
            <ShiftReport socket={socket} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;