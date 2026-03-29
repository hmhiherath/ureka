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

  // --- PREMIUM UI STYLING FUNCTIONS ---

  const baseInputStyle = {
    width: '100%', 
    padding: '12px 14px', 
    margin: '6px 0 16px 0',
    borderRadius: '8px', 
    background: 'rgba(0, 0, 0, 0.2)', // Dark inset background
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    color: '#f8fafc',
    fontSize: '14px', 
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  const focusEffect = (e) => {
    e.target.style.borderColor = '#38bdf8';
    e.target.style.background = 'rgba(15, 23, 42, 0.8)';
    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
  };

  const blurEffect = (e) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    e.target.style.background = 'rgba(0, 0, 0, 0.2)';
    e.target.style.boxShadow = 'none';
  };

  const getPillStyle = (isSelected) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    // The "Glowing Selected" vs "Dim Unselected" logic
    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
    color: isSelected ? '#38bdf8' : '#94a3b8',
    boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
    opacity: disabled ? 0.5 : 1
  });

  const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' };

  return (
    <div style={{ opacity: disabled ? 0.7 : 1, transition: 'opacity 0.3s' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px', fontWeight: '800' }}>Patient Intake</h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Enter clinical data to calculate ATSS priority.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input required style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={disabled} placeholder="e.g. John Doe"/>
          </div>
          <div>
            <label style={labelStyle}>Age</label>
            <input required type="number" style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} disabled={disabled}/>
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} disabled={disabled}>
              <option value="Male" style={{background: '#0f172a'}}>Male</option>
              <option value="Female" style={{background: '#0f172a'}}>Female</option>
              <option value="Other" style={{background: '#0f172a'}}>Other</option>
            </select>
          </div>
        </div>

        {/* Vitals Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '1px' }}>Vitals & Pain</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            <div><label style={labelStyle}>HR</label><input required style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.hr} onChange={e => setFormData({...formData, hr: e.target.value})} disabled={disabled} placeholder="BPM"/></div>
            <div><label style={labelStyle}>SBP</label><input required style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.sbp} onChange={e => setFormData({...formData, sbp: e.target.value})} disabled={disabled} placeholder="mmHg"/></div>
            <div><label style={labelStyle}>DBP</label><input required style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.dbp} onChange={e => setFormData({...formData, dbp: e.target.value})} disabled={disabled} placeholder="mmHg"/></div>
            <div><label style={labelStyle}>Temp</label><input required style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} disabled={disabled} placeholder="°C"/></div>
            <div><label style={labelStyle}>Pain</label><input required type="number" min="1" max="10" style={baseInputStyle} onFocus={focusEffect} onBlur={blurEffect} value={formData.pain_level} onChange={e => setFormData({...formData, pain_level: e.target.value})} disabled={disabled} placeholder="1-10"/></div>
          </div>
        </div>

        {/* Symptoms Pills */}
        <label style={{ ...labelStyle, display: 'block', marginBottom: '12px' }}>Active Symptoms</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          {AVAILABLE_SYMPTOMS.map(item => (
            <div 
              key={item.id} 
              style={getPillStyle(formData.symptoms.includes(item.id))}
              onClick={() => handleToggle("symptoms", item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Conditions Pills */}
        <label style={{ ...labelStyle, display: 'block', marginBottom: '12px' }}>Pre-existing Conditions</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px' }}>
          {AVAILABLE_CONDITIONS.map(item => (
            <div 
              key={item.id} 
              style={getPillStyle(formData.conditions.includes(item.id))}
              onClick={() => handleToggle("conditions", item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Glowing Submit Button */}
        <button type="submit" disabled={disabled} style={{
          width: '100%', padding: '16px', 
          background: disabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(90deg, #2563eb, #38bdf8)', 
          color: disabled ? '#64748b' : '#fff',
          border: 'none', borderRadius: '8px', 
          fontSize: '14px', fontWeight: '800', letterSpacing: '1px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(56, 189, 248, 0.4)',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase'
        }}
        onMouseOver={(e) => !disabled && (e.target.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => !disabled && (e.target.style.transform = 'translateY(0)')}
        >
          {disabled ? 'System Offline' : 'Transmit to Queue'}
        </button>
      </form>
    </div>
  );
};

export default TriageForm;