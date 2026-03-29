import React, { useState, useEffect } from 'react';

const ShiftReport = ({ socket }) => {
  const [treatedHistory, setTreatedHistory] = useState([]);

  // Load history from LocalStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('triageTreatedHistory');
    if (savedHistory) {
      try {
        setTreatedHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse local history");
      }
    }
  }, []);

  // Listen for 'patient_called' to update local history
  useEffect(() => {
    if (!socket) return;

    const handlePatientCalled = (data) => {
      setTreatedHistory(prev => {
        const newRecord = { ...data, timeTreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
        const newHistory = [newRecord, ...prev]; 
        localStorage.setItem('triageTreatedHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    };

    socket.on('patient_called', handlePatientCalled);

    return () => {
      socket.off('patient_called', handlePatientCalled);
    };
  }, [socket]);

  const clearHistory = () => {
    if(window.confirm("SECURE OVERRIDE: Are you sure you want to permanently purge the local shift history?")) {
      localStorage.removeItem('triageTreatedHistory');
      setTreatedHistory([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px', fontWeight: '800' }}>Mission Log</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            Local Node Memory
          </p>
        </div>
        <button 
          onClick={clearHistory} 
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            color: '#fca5a5', 
            fontSize: '11px', 
            fontWeight: '700',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            e.target.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Purge Log
        </button>
      </div>

      {/* The Timeline Container */}
      {treatedHistory.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: '#64748b', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '12px',
          border: '1px dashed rgba(255, 255, 255, 0.05)',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px', opacity: 0.5 }}>🗄️</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>No local records found for this shift.</div>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          paddingLeft: '10px', 
          marginTop: '10px'
        }}>
          {treatedHistory.map((record, index) => (
            <div key={index} style={{ 
              position: 'relative', 
              paddingLeft: '24px', 
              paddingBottom: '24px',
              // Draws the glowing vertical line connecting the nodes
              borderLeft: index === treatedHistory.length - 1 ? 'none' : '2px solid rgba(56, 189, 248, 0.2)'
            }}>
              
              {/* Glowing Node Dot */}
              <div style={{
                position: 'absolute',
                left: '-5px', // Centers the 8px dot exactly on the 2px border
                top: '0',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 12px #38bdf8',
                zIndex: 2
              }}></div>

              {/* Patient Record Card */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '14px', 
                borderRadius: '8px',
                marginTop: '-6px', // Aligns the box nicely with the dot
                transition: 'background 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#e2e8f0', letterSpacing: '0.3px' }}>
                      {record.name}
                    </strong>
                    <small style={{ color: '#64748b', fontWeight: '600' }}>ID: #{record.id}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '12px', color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace' }}>
                      {record.timeTreated}
                    </span>
                    <span style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                      Dispatched
                    </span>
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftReport;