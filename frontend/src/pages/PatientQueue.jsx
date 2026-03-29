import React from 'react';
import { useSocket } from '../hooks/useSocket';
import PatientCard from '../components/PatientCard';

const PatientQueue = () => {
  // Pull live data and actions from our Singleton WebSocket hook
  const { queue, isConnected, emitTreatNext } = useSocket();

  // Handler for extracting a patient from the queue
  const handleTreatNext = (patientId) => {
    // Find the patient to display their name in the confirmation dialog
    const patient = queue.find(p => p.id === patientId);
    if (!patient) return;

    // Safety First: Medical applications require confirmation to prevent misclicks
    const confirmMsg = `Confirm Action: Call ${patient.name} to Treatment?\n\nThis will extract them from the priority heap and update their status.`;
    
    if (window.confirm(confirmMsg)) {
      // Tells the Python backend to run heap.extract_next()
      emitTreatNext();
    }
  };

  return (
    <div className="queue-page-container">
      {/* --- Header & Status --- */}
      <header className="page-header">
        <div className="header-titles">
          <h2>Live Triage Queue</h2>
          <p className="subtitle">Ordered by Advanced Triage Severity Score (ATSS)</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-label">Total Waiting:</span>
            <span className="stat-value">{queue.length}</span>
          </div>
        </div>
      </header>

      {/* --- Connection Warning --- */}
      {!isConnected && (
        <div className="connection-banner alert-danger">
          ⚠️ <strong>Connection Lost:</strong> Attempting to reconnect to the triage server. Data may not be up to date.
        </div>
      )}

      {/* --- The Queue List --- */}
      <div className="queue-list-container">
        {queue.length === 0 ? (
          <div className="empty-state-box">
            <span className="empty-icon">🏥</span>
            <h3>No Patients Waiting</h3>
            <p>The triage queue is currently empty. All patients have been treated.</p>
          </div>
        ) : (
          <div className="patient-cards-wrapper">
            {queue.map((patient, index) => (
              <div key={patient.id} className="queue-item">
                
                {/* Visual highlight for the root node of the Max-Heap */}
                {index === 0 && (
                  <div className="next-up-banner">
                    ⭐ HIGHEST PRIORITY - NEXT TO BE TREATED
                  </div>
                )}

                {/* ENGINEERING CONSTRAINT: 
                  Because our backend uses a strict Max-Heap, you can ONLY extract the root node (index 0).
                  Therefore, we only pass the 'onTreatNext' function to the very first patient in the array.
                */}
                <PatientCard 
                  patient={patient} 
                  onTreatNext={index === 0 ? handleTreatNext : null} 
                />
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;