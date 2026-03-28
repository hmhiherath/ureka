import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';

const INITIAL_STATE = {
  name: '',
  age: '',
  gender: 'Male',
  symptoms: '',
  conditions: '',
  hr: '',
  sbp: '',
  dbp: '',
  temp: '',
  pain_level: 5 // Default middle pain
};

const TriageForm = () => {
  const { emitNewPatient, isConnected } = useSocket();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form Submission Logic
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Format the data to perfectly match your Pydantic Schema in Python
      const payload = {
        name: formData.name,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        
        // Convert comma-separated strings into Arrays of strings for the Synergy Matrix
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s !== ''),
        conditions: formData.conditions.split(',').map(c => c.trim()).filter(c => c !== ''),
        
        // Nest the vitals as expected by the VitalsSchema
        vitals: {
          hr: parseInt(formData.hr, 10),
          sbp: parseInt(formData.sbp, 10),
          dbp: parseInt(formData.dbp, 10),
          temp: parseFloat(formData.temp)
        },
        
        pain_level: parseInt(formData.pain_level, 10)
      };

      // 2. Emit via WebSocket
      emitNewPatient(payload);

      // 3. Reset form and navigate back to the live queue
      setFormData(INITIAL_STATE);
      
      // Optional: Add a small delay so the nurse can see the "Submitting..." state
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/admin'); // Redirects to the PatientQueue view
      }, 500);

    } catch (error) {
      console.error("Error formatting payload:", error);
      alert("Please ensure all numerical fields contain valid numbers.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="triage-form-container">
      <div className="form-header">
        <h2>New Patient Intake</h2>
        <p>Enter patient demographics and current vitals to calculate initial ATSS priority.</p>
      </div>

      {!isConnected && (
        <div className="alert-banner alert-danger">
          ⚠️ Cannot submit: Disconnected from Triage Server.
        </div>
      )}

      <form onSubmit={handleSubmit} className="triage-form">
        
        {/* --- SECTION 1: Demographics --- */}
        <fieldset className="form-section">
          <legend>1. Demographics</legend>
          <div className="input-row">
            <div className="input-group full-width">
              <label htmlFor="name">Full Name *</label>
              <input type="text" id="name" name="name" required 
                value={formData.name} onChange={handleChange} 
                placeholder="e.g., Jane Doe" />
            </div>
          </div>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="age">Age *</label>
              <input type="number" id="age" name="age" min="1" max="120" required 
                value={formData.age} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label htmlFor="gender">Gender *</label>
              <select id="gender" name="gender" required value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* --- SECTION 2: Clinical Context --- */}
        <fieldset className="form-section">
          <legend>2. Clinical Context</legend>
          <div className="input-group full-width">
            <label htmlFor="symptoms">Primary Symptoms * <span className="hint">(Comma separated)</span></label>
            <input type="text" id="symptoms" name="symptoms" required 
              value={formData.symptoms} onChange={handleChange} 
              placeholder="e.g., chest_pain, shortness_of_breath, fever" />
          </div>
          <div className="input-group full-width">
            <label htmlFor="conditions">Pre-existing Conditions <span className="hint">(Optional, comma separated)</span></label>
            <input type="text" id="conditions" name="conditions" 
              value={formData.conditions} onChange={handleChange} 
              placeholder="e.g., asthma, diabetes, heart_disease" />
          </div>
        </fieldset>

        {/* --- SECTION 3: Vital Signs --- */}
        <fieldset className="form-section">
          <legend>3. Vital Signs</legend>
          <div className="vitals-input-grid">
            <div className="input-group">
              <label htmlFor="hr">Heart Rate (bpm) *</label>
              <input type="number" id="hr" name="hr" min="30" max="250" required 
                value={formData.hr} onChange={handleChange} placeholder="e.g., 85" />
            </div>
            <div className="input-group">
              <label htmlFor="temp">Temp (°C) *</label>
              <input type="number" step="0.1" id="temp" name="temp" min="30" max="45" required 
                value={formData.temp} onChange={handleChange} placeholder="e.g., 37.5" />
            </div>
            <div className="input-group">
              <label htmlFor="sbp">Systolic BP *</label>
              <input type="number" id="sbp" name="sbp" min="50" max="250" required 
                value={formData.sbp} onChange={handleChange} placeholder="e.g., 120" />
            </div>
            <div className="input-group">
              <label htmlFor="dbp">Diastolic BP *</label>
              <input type="number" id="dbp" name="dbp" min="30" max="150" required 
                value={formData.dbp} onChange={handleChange} placeholder="e.g., 80" />
            </div>
          </div>
        </fieldset>

        {/* --- SECTION 4: Pain Assessment --- */}
        <fieldset className="form-section">
          <legend>4. Pain Assessment</legend>
          <div className="input-group full-width pain-slider-group">
            <label htmlFor="pain_level">Reported Pain Level: <span className="pain-display">{formData.pain_level}/10</span></label>
            <input type="range" id="pain_level" name="pain_level" min="1" max="10" required 
              value={formData.pain_level} onChange={handleChange} className="pain-slider" />
            <div className="slider-labels">
              <span>Mild (1)</span>
              <span>Moderate (5)</span>
              <span>Severe (10)</span>
            </div>
          </div>
        </fieldset>

        {/* --- Form Actions --- */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isConnected || isSubmitting}>
            {isSubmitting ? 'Calculating ATSS...' : 'Submit to Triage Queue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TriageForm;