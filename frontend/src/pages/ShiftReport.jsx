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
        const newRecord = { ...data, timeTreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
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
      {/* Header section - Fixed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexShrink: 0 }}>
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
            textTransform: 'uppercase'
          }}
        >
          Purge Log
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '4px' }}>
        {treatedHistory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#64748b', 
            background: 'rgba(0, 0, 0, 0.2)', 
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px', opacity: 0.5 }}>🗄️</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>No records found.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '10px', marginTop: '10px' }}>
            {treatedHistory.map((record, index) => (
              <div key={index} style={{ 
                position: 'relative', 
                paddingLeft: '24px', 
                paddingBottom: '24px',
                borderLeft: index === treatedHistory.length - 1 ? 'none' : '2px solid rgba(56, 189, 248, 0.2)'
              }}>
                <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 12px #38bdf8', zIndex: 2 }}></div>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '14px', 
                  borderRadius: '8px',
                  marginTop: '-6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#e2e8f0' }}>{record.name}</strong>
                      <small style={{ color: '#64748b', fontWeight: '600' }}>ID: #{record.id}</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#38bdf8', fontWeight: '800' }}>{record.timeTreated}</span>
                      <span style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase' }}>Dispatched</span>
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