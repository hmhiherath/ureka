import React from 'react';
import PatientCard from '../components/PatientCard'; // Assuming you have this visual component

const PatientQueue = ({ queue, socket, disabled }) => {
  
  const handleTreatNext = () => {
    if (!disabled && socket) {
      // Emit event to pop the highest priority patient off the backend Max-Heap
      socket.emit('treat_next');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Live Queue (Max-Heap)</h3>
        
        <button 
          onClick={handleTreatNext}
          disabled={disabled || queue.length === 0}
          style={{
            padding: '10px 24px',
            background: (disabled || queue.length === 0) ? '#cbd5e1' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: (disabled || queue.length === 0) ? 'not-allowed' : 'pointer',
            boxShadow: (disabled || queue.length === 0) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          👨‍⚕️ TREAT NEXT PATIENT
        </button>
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Queue is Empty</p>
          <small>Waiting for new patient intake...</small>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {queue.map((patient, index) => (
            // We pass rank=index+1 so the UI shows who is 1st, 2nd, etc.
            <PatientCard key={patient.id} patient={patient} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientQueue;