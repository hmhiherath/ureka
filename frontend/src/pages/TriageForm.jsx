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

// NOTE: We now accept socket and disabled as props from Dashboard.jsx
const TriageForm = ({ socket, disabled }) => {
  const initialFormState = {
    name: '', age: '', gender: 'Other', pain_level: 5,
    hr: '', sbp: '', dbp: '', temp: '', 
    symptoms: [], conditions: [] 
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleCheckboxChange = (category, value) => {
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

    // Format data to match Pydantic schema expectations in backend
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

    // Emit over WebSocket instead of using fetch() POST
    socket.emit('new_patient', payload);
    
    // Clear form instantly for the next patient
    setFormData(initialFormState);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', margin: '4px 0 16px 0',
    borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box'
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#0f172a' }}>Patient Intake</h3>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Enter clinical data to calculate priority.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Full Name</label>
            <input required style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={disabled}/>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Age</label>
            <input required type="number" style={inputStyle} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} disabled={disabled}/>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Gender</label>
            <select style={inputStyle} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} disabled={disabled}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#334155', textTransform: 'uppercase' }}>Vitals & Pain</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            <div><small>HR</small><input required style={inputStyle} value={formData.hr} onChange={e => setFormData({...formData, hr: e.target.value})} disabled={disabled}/></div>
            <div><small>SBP</small><input required style={inputStyle} value={formData.sbp} onChange={e => setFormData({...formData, sbp: e.target.value})} disabled={disabled}/></div>
            <div><small>DBP</small><input required style={inputStyle} value={formData.dbp} onChange={e => setFormData({...formData, dbp: e.target.value})} disabled={disabled}/></div>
            <div><small>Temp(°C)</small><input required style={inputStyle} value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} disabled={disabled}/></div>
            <div><small>Pain (1-10)</small><input required type="number" min="1" max="10" style={inputStyle} value={formData.pain_level} onChange={e => setFormData({...formData, pain_level: e.target.value})} disabled={disabled}/></div>
          </div>
        </div>

        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Symptoms</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {AVAILABLE_SYMPTOMS.map(item => (
            <label key={item.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', opacity: disabled ? 0.5 : 1 }}>
              <input type="checkbox" style={{ marginRight: '8px' }} checked={formData.symptoms.includes(item.id)} onChange={() => handleCheckboxChange("symptoms", item.id)} disabled={disabled} />
              {item.label}
            </label>
          ))}
        </div>

        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Conditions</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {AVAILABLE_CONDITIONS.map(item => (
            <label key={item.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', opacity: disabled ? 0.5 : 1 }}>
              <input type="checkbox" style={{ marginRight: '8px' }} checked={formData.conditions.includes(item.id)} onChange={() => handleCheckboxChange("conditions", item.id)} disabled={disabled} />
              {item.label}
            </label>
          ))}
        </div>

        <button type="submit" disabled={disabled} style={{
          width: '100%', padding: '14px', background: disabled ? '#94a3b8' : '#2563eb', color: '#fff',
          border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: disabled ? 'not-allowed' : 'pointer'
        }}>
          {disabled ? 'CONNECTION OFFLINE' : 'ADMIT TO QUEUE'}
        </button>
      </form>
    </div>
  );
};

export default TriageForm;