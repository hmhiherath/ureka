import React, { useState, useEffect } from 'react';

const ShiftReport = ({ socket }) => {
  const [treatedHistory, setTreatedHistory] = useState([]);

  // Load history from LocalStorage
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

  // Socket listener for new treated patients
  useEffect(() => {
    if (!socket) return;

    const handlePatientCalled = (data) => {
      setTreatedHistory(prev => {
        const newRecord = { 
          ...data, 
          timeTreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        const newHistory = [newRecord, ...prev]; 
        localStorage.setItem('triageTreatedHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    };

    socket.on('patient_called', handlePatientCalled);
    return () => socket.off('patient_called', handlePatientCalled);
  }, [socket]);

  const clearHistory = () => {
    if(window.confirm("SECURE OVERRIDE: Purge local shift history?")) {
      localStorage.removeItem('triageTreatedHistory');
      setTreatedHistory([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Right-Aligned Purge Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexShrink: 0,
        width: '100%'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Mission Log
          </h3>
          <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
            Local Node Active
          </span>
        </div>
        
        {/* Purge button strictly right-aligned */}
        <button 
          onClick={clearHistory} 
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            color: '#ef4444', 
            fontSize: '10px', 
            fontWeight: '800',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            flexShrink: 0
          }}
        >
          Purge Log
        </button>
      </div>

      {/* Timeline Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {treatedHistory.length === 0 ? (
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end', // Aligns the message to the right
            padding: '20px 0'
          }}>
            <div style={{ 
              textAlign: 'right',
              color: '#475569', 
              borderRight: '2px solid rgba(56, 189, 248, 0.3)',
              paddingRight: '12px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Waiting for deployments
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '10px', opacity: 0.6 }}>System Idle...</p>
            </div>
          </div>
        ) : (
          treatedHistory.map((record, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px'
            }}>
              {/* Vertical Connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', zIndex: 2 }}></div>
                {index !== treatedHistory.length - 1 && (
                  <div style={{ width: '2px', flex: 1, background: 'rgba(56, 189, 248, 0.2)', marginTop: '4px' }}></div>
                )}
              </div>

              {/* Patient Card */}
              <div style={{ 
                flex: 1,
                background: 'rgba(30, 41, 59, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px', 
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>ID: #{record.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '900' }}>{record.timeTreated}</div>
                    <div style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Dispatched</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShiftReport;