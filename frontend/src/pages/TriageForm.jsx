import React, { useState } from 'react';

const TriageForm = () => {
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Other', pain_level: 5,
    hr: '', sbp: '', dbp: '', temp: '', symptoms: ''
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    margin: '8px 0 20px 0',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  const focusEffect = (e) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
  };

  const blurEffect = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>New Patient Intake</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>Enter clinical data to calculate Max-Heap priority score.</p>
        
        <form>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Full Name</label>
              <input style={inputStyle} onFocus={focusEffect} onBlur={blurEffect} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Age</label>
              <input type="number" style={inputStyle} onFocus={focusEffect} onBlur={blurEffect} />
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Gender</label>
              <select style={inputStyle} onFocus={focusEffect} onBlur={blurEffect}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px dashed #cbd5e1' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vital Signs</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              <div><small>Heart Rate</small><input placeholder="BPM" style={inputStyle} onFocus={focusEffect} onBlur={blurEffect} /></div>
              <div><small>Systolic</small><input placeholder="mmHg" style={inputStyle} onFocus={focusEffect} onBlur={blurEffect} /></div>
              <div><small>Diastolic</small><input placeholder="mmHg" style={inputStyle} onFocus={focusEffect} onBlur={blurEffect} /></div>
              <div><small>Temp</small><input placeholder="°C" style={inputStyle} onFocus={focusEffect} onBlur={blurEffect} /></div>
            </div>
          </div>

          <label style={{ fontWeight: '600', color: '#475569', fontSize: '14px' }}>Symptoms / Chief Complaint</label>
          <textarea style={{ ...inputStyle, height: '100px', resize: 'none' }} onFocus={focusEffect} onBlur={blurEffect} placeholder="Describe patient condition..."></textarea>

          <button style={{
            width: '100%',
            padding: '16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.background = '#2563eb'}
          >
            ADMIT TO TRIAGE QUEUE
          </button>
        </form>
      </div>
    </div>
  );
};

export default TriageForm;
