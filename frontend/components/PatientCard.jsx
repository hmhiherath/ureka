import React from 'react';

const PatientCard = ({ patient, onTreatNext }) => {
  // Destructure the patient object for cleaner JSX
  const {
    id,
    name,
    age,
    gender,
    vitals,
    symptoms,
    conditions,
    pain_level,
    severity_score,
    wait_time_mins,
    escalated,
    status
  } = patient;

  // Determine the CSS class based on priority to color-code the card
  const getCardVariant = () => {
    if (escalated) return 'card-urgent-escalated';
    if (severity_score >= 100) return 'card-critical';
    if (severity_score >= 50) return 'card-warning';
    return 'card-standard';
  };

  return (
    <div className={`patient-card ${getCardVariant()}`}>
      
      {/* HEADER: Demographics & Badges */}
      <div className="card-header">
        <div className="header-left">
          <span className="patient-id">#{id}</span>
          <h3 className="patient-name">{name}</h3>
          <span className="patient-demographics">
            {age}y • {gender.charAt(0).toUpperCase() + gender.slice(1)}
          </span>
        </div>
        <div className="header-right">
          {escalated && <span className="badge badge-escalated">⚠️ Escalated</span>}
          <span className="badge badge-score">ATSS: {severity_score.toFixed(1)}</span>
        </div>
      </div>

      {/* BODY: Vitals & Clinical Context */}
      <div className="card-body">
        
        {/* Vitals Grid */}
        <div className="vitals-section">
          <h4 className="section-title">Current Vitals</h4>
          <div className="vitals-grid">
            <div className="vital-box">
              <span className="vital-label">HR</span>
              <span className={`vital-value ${vitals.hr > 100 || vitals.hr < 60 ? 'text-danger' : ''}`}>
                {vitals.hr} <small>bpm</small>
              </span>
            </div>
            <div className="vital-box">
              <span className="vital-label">BP</span>
              <span className="vital-value">
                {vitals.sbp}/{vitals.dbp}
              </span>
            </div>
            <div className="vital-box">
              <span className="vital-label">Temp</span>
              <span className={`vital-value ${vitals.temp > 38.0 ? 'text-danger' : ''}`}>
                {vitals.temp}°C
              </span>
            </div>
            <div className="vital-box">
              <span className="vital-label">Pain</span>
              <span className={`vital-value ${pain_level >= 8 ? 'text-danger' : ''}`}>
                {pain_level}/10
              </span>
            </div>
          </div>
        </div>

        {/* Symptoms & History */}
        <div className="clinical-section">
          <div className="info-group">
            <span className="info-label">Symptoms: </span>
            <span className="info-text">
              {symptoms.length > 0 ? symptoms.join(', ') : 'None reported'}
            </span>
          </div>
          <div className="info-group">
            <span className="info-label">History: </span>
            <span className="info-text text-muted">
              {conditions.length > 0 ? conditions.join(', ') : 'No known conditions'}
            </span>
          </div>
        </div>

      </div>

      {/* FOOTER: Timing & Actions */}
      <div className="card-footer">
        <div className="wait-time-indicator">
          <span className="time-icon">⏱️</span>
          <span>Waiting: <strong>{wait_time_mins} mins</strong></span>
          <span className={`status-text ${status.toLowerCase()}`}> ({status})</span>
        </div>
        
        {/* Only show the "Treat Patient" button if the callback is provided */}
        {onTreatNext && (
          <button 
            className="action-btn treat-btn"
            onClick={() => onTreatNext(id)}
            disabled={status === 'Treated'}
          >
            {status === 'Treated' ? 'Treatment Started' : 'Call to Treatment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientCard;