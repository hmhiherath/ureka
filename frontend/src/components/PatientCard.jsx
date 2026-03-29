import React from 'react';

const PatientCard = ({ patient, rank }) => {
  // ATSS Score over 70 is considered Critical for our UI glow effects
  const isCritical = patient.severity_score >= 70;
  const isWarning = patient.wait_time_mins > 30; // Waiting over 30 mins triggers a warning color
  
  const cardStyle = {
    background: isCritical ? 'linear-gradient(145deg, rgba(30, 10, 10, 0.8) 0%, rgba(15, 5, 5, 0.9) 100%)' : 'rgba(15, 23, 42, 0.4)',
    border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: isCritical ? '0 10px 30px -5px rgba(239, 68, 68, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const tagStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    color: '#94a3b8',
    textTransform: 'capitalize'
  };

  return (
    <div 
      style={cardStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isCritical ? '0 15px 35px -5px rgba(239, 68, 68, 0.25)' : '0 10px 20px rgba(0,0,0,0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isCritical ? '0 10px 30px -5px rgba(239, 68, 68, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
      }}
    >
      {/* Background Accent Glow for Critical Patients */}
      {isCritical && (
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '120px', height: '120px', background: '#ef4444', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }}></div>
      )}

      {/* Header: Rank, Name, and Wait Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: isCritical ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #38bdf8, #0369a1)', 
            color: '#fff', 
            width: '32px', height: '32px', 
            borderRadius: '8px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            fontWeight: '900', fontSize: '16px',
            boxShadow: isCritical ? '0 4px 10px rgba(239, 68, 68, 0.4)' : '0 4px 10px rgba(56, 189, 248, 0.3)'
          }}>
            {rank}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>{patient.name}</h4>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ID: #{patient.id} • {patient.age}yo {patient.gender} • Score: <span style={{color: isCritical ? '#fca5a5' : '#e2e8f0'}}>{patient.severity_score}</span></span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '26px', fontWeight: '900', color: isWarning ? '#fca5a5' : '#f8fafc', lineHeight: '1', letterSpacing: '-1px' }}>
            {patient.wait_time_mins}<span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>m</span>
          </div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: isWarning ? '#ef4444' : '#64748b', fontWeight: '800' }}>
            {patient.escalated ? 'ESCALATED' : 'WAITING'}
          </span>
        </div>
      </div>

      {/* Vitals Grid - Premium "Dashboard" look */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>Heart</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc' }}>{patient.vitals.hr} <small style={{fontSize:'10px', color:'#475569', fontWeight:'600'}}>bpm</small></div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>BP</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc' }}>{patient.vitals.sbp}<span style={{color: '#475569'}}>/</span>{patient.vitals.dbp}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>Temp</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#f8fafc' }}>{patient.vitals.temp}°</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>Pain</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: patient.pain_level >= 8 ? '#fca5a5' : '#f8fafc' }}>{patient.pain_level}<span style={{color: '#475569'}}>/10</span></div>
        </div>
      </div>

      {/* Pill Tags for Symptoms & Conditions */}
      {(patient.symptoms.length > 0 || patient.conditions.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {patient.symptoms.map(sym => (
            <span key={`sym-${sym}`} style={{...tagStyle, color: isCritical ? '#fca5a5' : '#bae6fd', borderColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)', background: isCritical ? 'rgba(239,68,68,0.05)' : 'rgba(56,189,248,0.05)'}}>
              {sym.replace(/_/g, ' ')}
            </span>
          ))}
          {patient.conditions.map(cond => (
            <span key={`cond-${cond}`} style={tagStyle}>
              {cond.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientCard;