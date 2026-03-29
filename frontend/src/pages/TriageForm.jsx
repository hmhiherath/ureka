import React, { useState } from 'react';

const AVAILABLE_SYMPTOMS = [
  { id: "chest_pain", label: "Chest Pain" },
  { id: "shortness_of_breath", label: "Shortness of Breath" },
  { id: "severe_bleeding", label: "Severe Bleeding" },
  { id: "fever", label: "Fever" },
  { id: "headache", label: "Headache" },
  { id: "rash", label: "Rash" }
];

const AVAILABLE_CONDITIONS = [
  { id: "asthma", label: "Asthma" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "hypertension", label: "Hypertension" },
  { id: "diabetes", label: "Diabetes" }
];

const TriageForm = ({ socket, disabled }) => {
  const initialFormState = {
    name: '', age: '', gender: 'Other', pain_level: 5,
    hr: '', sbp: '', dbp: '', temp: '', 
    symptoms: [], conditions: [] 
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleToggle = (category, value) => {
    if (disabled) return;
    setFormData(prev => {
      const currentList = prev[category];
      if (currentList.includes(value)) {
        return { ...prev, [category]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentList, value] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled || !socket) return;

    const payload = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      pain_level: parseInt(formData.pain_level),
      vitals: {
        hr: parseInt(formData.hr),
        sbp: parseInt(formData.sbp),
        dbp: parseInt(formData.dbp),
        temp: parseFloat(formData.temp)
      },
      symptoms: formData.symptoms,
      conditions: formData.conditions
    };

    socket.emit('new_patient', payload);
    setFormData(initialFormState);
  };

  const baseInputStyle = {
    width: '100%', 
    padding: '12px 14px', 
    margin: '6px 0 16px 0',
    borderRadius: '8px', 
    background: 'rgba(0, 0, 0, 0.2)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    color: '#f8fafc',
    fontSize: '14px', 
    boxSizing: 'border-box',
    outline: 'none'
  };

  const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' };

  const getPillStyle = (isSelected) => ({
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
    color: isSelected ? '#38bdf8' : '#94a3b8',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px', fontWeight: '900' }}>Patient Intake</h3>
        <p style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>ATSS Priority System</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {/* Top Info Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input required style={baseInputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={disabled} placeholder="Patient Name"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input required type="number" style={baseInputStyle} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} disabled={disabled}/>
              </div>
              <div>
                <label style={labelStyle}>Sex</label>
                <select style={baseInputStyle} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} disabled={disabled}>
                  <option value="Male">M</option>
                  <option value="Female">F</option>
                  <option value="Other">O</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vitals Grid - 2x3 for better spacing */}
          <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div><label style={labelStyle}>HR</label><input required style={baseInputStyle} value={formData.hr} onChange={e => setFormData({...formData, hr: e.target.value})} disabled={disabled} placeholder="bpm"/></div>
              <div><label style={labelStyle}>SBP</label><input required style={baseInputStyle} value={formData.sbp} onChange={e => setFormData({...formData, sbp: e.target.value})} disabled={disabled} placeholder="sys"/></div>
              <div><label style={labelStyle}>DBP</label><input required style={baseInputStyle} value={formData.dbp} onChange={e => setFormData({...formData, dbp: e.target.value})} disabled={disabled} placeholder="dia"/></div>
              <div><label style={labelStyle}>Temp</label><input required style={baseInputStyle} value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} disabled={disabled} placeholder="°C"/></div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Pain Scale (1-10)</label>
                <input required type="number" min="1" max="10" style={baseInputStyle} value={formData.pain_level} onChange={e => setFormData({...formData, pain_level: e.target.value})} disabled={disabled}/>
              </div>
            </div>
          </div>

          <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Active Symptoms</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            {AVAILABLE_SYMPTOMS.map(item => (
              <div key={item.id} style={getPillStyle(formData.symptoms.includes(item.id))} onClick={() => handleToggle("symptoms", item.id)}>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button anchored to bottom */}
        <button type="submit" disabled={disabled} style={{
          width: '100%', padding: '16px', 
          background: disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #1e40af, #0284c7)', 
          color: disabled ? '#475569' : '#fff',
          border: 'none', borderRadius: '8px', 
          fontSize: '13px', fontWeight: '900', letterSpacing: '1px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          marginTop: 'auto'
        }}>
          {disabled ? 'System Offline' : 'Transmit Patient Data'}
        </button>
      </form>
    </div>
  );
};

export default TriageForm;