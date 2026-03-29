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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* --- HEADER SECTION --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexShrink: 0,
        padding: '4px 12px 0 4px' 
      }}>
        <div style={{ flexShrink: 0 }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Mission Log
          </h3>
          <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
            Local Node Active
          </span>
        </div>
        
        {/* CIRCULAR PURGE BUTTON */}
        <button 
          onClick={clearHistory} 
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '2px solid #ef4444', 
            color: '#ef4444', 
            // Equal width and height for a perfect circle
            width: '52px', 
            height: '52px', 
            borderRadius: '50%',
            // Flexbox centering for text
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px', 
            fontWeight: '900',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            margin: '4px', 
            boxSizing: 'border-box',
            flexShrink: 0,
            lineHeight: '1'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            e.target.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Purge
        </button>
      </div>

      {/* --- SCROLLABLE LOG CONTENT --- */}
      <div className="custom-scrollbar" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        minHeight: 0,
        paddingLeft: '10px',
        paddingRight: '4px'
      }}>
        {treatedHistory.length === 0 ? (
          <div style={{ display: 'flex', gap: '16px', padding: '10px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #334155' }}></div>
            </div>
            <div style={{ textAlign: 'left', color: '#475569' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Waiting for deployments</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {treatedHistory.map((record, index) => (
              <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                
                {/* Timeline Visuals */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px', flexShrink: 0 }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: '#38bdf8', 
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)', 
                    zIndex: 2,
                    marginTop: '4px' 
                  }}></div>
                  {index !== treatedHistory.length - 1 && (
                    <div style={{ 
                      width: '2px', 
                      flex: 1, 
                      background: 'linear-gradient(rgba(56, 189, 248, 0.3), rgba(56, 189, 248, 0.05))',
                      marginTop: '4px' 
                    }}></div>
                  )}
                </div>

                {/* Patient Record Card */}
                <div style={{ 
                  flex: 1,
                  background: 'rgba(30, 41, 59, 0.5)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px', 
                  borderRadius: '8px',
                  marginRight: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {record.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: #{record.id}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '900' }}>{record.timeTreated}</div>
                      <div style={{ fontSize: '8px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Dispatched</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftReport;