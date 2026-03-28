import React from 'react';
import { useSocket } from '../hooks/useSocket';
import LiveClock from '../components/LiveClock';

const PublicMonitor = () => {
  // We only need the queue and connection status here; no action emitters needed
  const { queue, isConnected } = useSocket();

  // Check if any patient in the queue has been escalated by the background worker
  const hasEscalation = queue.some(patient => patient.escalated);

  return (
    // The 'dark-theme' class allows you to invert colors in App.css for high contrast
    <div className="public-monitor-container dark-theme">
      
      {/* --- KIOSK HEADER --- */}
      <header className="monitor-header">
        <div className="hospital-brand">
          <h1>EMERGENCY DEPARTMENT</h1>
          <h2>Live Triage Status</h2>
        </div>
        {/* The LiveClock component ensures patients know the display isn't frozen */}
        <div className="clock-wrapper">
          <LiveClock />
        </div>
      </header>

      {/* --- CRITICAL SYSTEM ALERTS --- */}
      {!isConnected && (
        <div className="monitor-alert-banner offline">
          ⚠️ DISPLAY OFFLINE - PLEASE WAIT FOR UPDATES ⚠️
        </div>
      )}

      {hasEscalation && (
        <div className="monitor-alert-banner escalated blink-animation">
          ⚠️ QUEUE RE-BALANCED: PRIORITY ESCALATION IN PROGRESS ⚠️
        </div>
      )}

      {/* --- THE PUBLIC QUEUE DISPLAY --- */}
      <div className="monitor-content">
        <table className="monitor-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Current Status</th>
              <th>Estimated Wait</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-row text-center">
                  All patients have been called to treatment rooms.
                </td>
              </tr>
            ) : (
              queue.map((patient, index) => (
                <tr 
                  key={patient.id} 
                  className={`
                    monitor-row 
                    ${index === 0 ? 'next-patient-row' : ''} 
                    ${patient.escalated ? 'escalated-highlight' : ''}
                  `}
                >
                  {/* PRIVACY: We strictly only show the ID, never the name or symptoms */}
                  <td className="ticket-id">#{patient.id}</td>
                  
                  <td className="status-cell">
                    {index === 0 ? (
                      <span className="status-calling">PROCEED TO TREATMENT ROOM</span>
                    ) : (
                      <span className="status-waiting">In Queue</span>
                    )}
                  </td>
                  
                  <td className="wait-time-cell">
                    {patient.wait_time_mins} <small>mins</small>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicMonitor;