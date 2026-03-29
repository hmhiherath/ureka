import React from 'react';
import PatientCard from '../components/PatientCard';

const PatientQueue = ({ queue, socket, disabled }) => {
  
  const handleTreatNext = () => {
    if (!disabled && socket) {
      socket.emit('treat_next');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: disabled ? 0.7 : 1, transition: 'opacity 0.3s' }}>
      {/* Action Header - Remains Fixed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px', fontWeight: '800' }}>Live Queue</h3>
          <p style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px', fontWeight: '600', letterSpacing: '0.5px' }}>MAX-HEAP ALGORITHM ACTIVE</p>
        </div>
        
        <button 
          onClick={handleTreatNext}
          disabled={disabled || queue.length === 0}
          style={{
            padding: '12px 24px',
            background: (disabled || queue.length === 0) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #059669, #10b981)',
            color: (disabled || queue.length === 0) ? '#64748b' : '#fff',
            border: (disabled || queue.length === 0) ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: '8px',
            fontWeight: '800',
            fontSize: '13px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: (disabled || queue.length === 0) ? 'not-allowed' : 'pointer',
            boxShadow: (disabled || queue.length === 0) ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '16px' }}>⚕️</span> TREAT NEXT
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
        {queue.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#64748b', 
            background: 'rgba(0, 0, 0, 0.2)', 
            borderRadius: '16px', 
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>🩺</div>
            <p style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: '700', color: '#94a3b8' }}>Queue is Empty</p>
            <small style={{ fontSize: '13px' }}>Awaiting incoming patient telemetry...</small>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
            {queue.map((patient, index) => (
              <PatientCard key={patient.id} patient={patient} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;