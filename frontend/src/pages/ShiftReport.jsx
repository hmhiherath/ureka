import React, { useState, useEffect } from 'react';

const ShiftReport = ({ socket }) => {
  const [treatedHistory, setTreatedHistory] = useState([]);

  // 1. Load history from LocalStorage on component mount
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

  // 2. Listen for 'patient_called' to update local history
  useEffect(() => {
    if (!socket) return;

    const handlePatientCalled = (data) => {
      setTreatedHistory(prev => {
        // Add timestamp to the backend payload
        const newRecord = { ...data, timeTreated: new Date().toLocaleTimeString() };
        const newHistory = [newRecord, ...prev]; // Add to top of list
        
        // Save back to LocalStorage immediately
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
    if(window.confirm("Are you sure you want to clear the local shift history?")) {
      localStorage.removeItem('triageTreatedHistory');
      setTreatedHistory([]);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Local Shift Record</h3>
        <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
          Clear
        </button>
      </div>
      
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', lineHeight: '1.4' }}>
        This history is saved in your browser. It will persist even if the server connection drops.
      </p>

      {treatedHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
          No patients treated yet during this session.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {treatedHistory.map((record, index) => (
            <div key={index} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>{record.name}</strong>
                <small style={{ color: '#64748b' }}>ID: #{record.id}</small>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>{record.timeTreated}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftReport;