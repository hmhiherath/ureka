import React, { useState, useEffect } from 'react';

const ShiftReport = ({ socket }) => {
  const [treatedHistory, setTreatedHistory] = useState([]);

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
      {/* Header: Left aligned with a more prominent Purge button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        flexShrink: 0 
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Mission Log
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
              Local Node Active
            </span>
            <button 
              onClick={clearHistory} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', // Added slight background for better visibility
                border: '1px solid rgba(239, 68, 68, 0.4)', 
                color: '#ef4444', 
                fontSize: '11px', // Increased font size
                fontWeight: '900',
                padding: '4px 10px', // Increased padding
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                letterSpacing: '0.5px'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              Purge
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {treatedHistory.length === 0 ? (
          <div style={{ 
            display: 'flex',
            gap: '12px',
            padding: '10px 0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #475569' }}></div>
            </div>
            <div style={{ textAlign: 'left', color: '#475569' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Waiting for deployments
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: '10px', opacity: 0.6 }}>Standing by for incoming data...</p>
            </div>
          </div>
        ) : (
          treatedHistory.map((record, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px rgba(56, 189, 248, 0.4)', zIndex: 2 }}></div>
                {index !== treatedHistory.length - 1 && (
                  <div style={{ width: '2px', flex: 1, background: 'rgba(56, 189, 248, 0.2)', marginTop: '4px' }}></div>
                )}
              </div>

              <div style={{ 
                flex: 1,
                background: 'rgba(30, 41, 59, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px', 
                borderRadius: '8px',
                marginTop: '-4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: #{record.id}</div>
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