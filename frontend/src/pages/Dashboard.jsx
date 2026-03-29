import React from 'react';
import useSocket from '../hooks/useSocket';

// Import our 3 core pillar components
import TriageForm from './TriageForm';
import PatientQueue from './PatientQueue';
import ShiftReport from './ShiftReport';

import '../App.css'; 

const Dashboard = () => {
  const { socket, isConnected, queue } = useSocket();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '27% 46% 27%', 
      gap: '20px', 
      height: '100%', 
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* LEFT PANEL: Intake Form */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.25)' // Higher visibility border
      }}>
        <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
          <TriageForm socket={socket} disabled={!isConnected} />
        </div>
      </div>

      {/* CENTER PANEL: Action Queue */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.5)', // Bright blue focal border
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
          <PatientQueue queue={queue} socket={socket} disabled={!isConnected} />
        </div>
      </div>

      {/* RIGHT PANEL: Mission Log */}
      <div className="glass-panel" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.25)' // Higher visibility border
      }}>
        <div style={{ overflowY: 'auto', padding: '24px', height: '100%' }}>
          <ShiftReport socket={socket} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;