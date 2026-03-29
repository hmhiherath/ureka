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
      {/* Optimized Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexShrink: 0 
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Mission Log
          </h3>
          <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
            Local Node Active
          </span>
        </div>
        <button 
          onClick={clearHistory} 
          style={{ 
            background: 'transparent', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            color: '#ef4444', 
            fontSize: '10px', 
            fontWeight: '800',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          Purge
        </button>
      </div>

      {/* Timeline with Auto-Fit Cards */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {treatedHistory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '30px 10px', 
            color: '#475569', 
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Waiting for deployments...</span>
          </div>
        ) : (
          treatedHistory.map((record, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px',
              position: 'relative'
            }}>
              {/* Vertical Connector Line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#38bdf8',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)',
                  zIndex: 2
                }}></div>
                {index !== treatedHistory.length - 1 && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    background: 'linear-gradient(rgba(56, 189, 248, 0.4), transparent)',
                    marginTop: '4px'
                  }}></div>
                )}
              </div>

              {/* Condensed Log Card */}
              <div style={{ 
                flex: 1,
                background: 'rgba(30, 41, 59, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 12px', 
                borderRadius: '8px',
                marginTop: '-4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#f1f5f9', 
                      fontWeight: '700', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {record.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      ID: #{record.id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '900' }}>
                      {record.timeTreated}
                    </div>
                    <div style={{ fontSize: '8px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      Dispatched
                    </div>
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