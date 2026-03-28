import React from 'react';

const SeverityBadge = ({ score, escalated = false }) => {
  // Format the score to 1 decimal place so it's clean for the UI
  const formattedScore = Number(score).toFixed(1);

  // Determine the configuration based on the severity logic
  let badgeClass = 'badge-standard';
  let label = 'Standard';
  let icon = '🟢';

  if (escalated) {
    // The background Python worker triggered this
    badgeClass = 'badge-escalated';
    label = 'Escalated';
    icon = '⚠️';
  } else if (score >= 100) {
    badgeClass = 'badge-critical';
    label = 'Critical';
    icon = '🔴';
  } else if (score >= 50) {
    badgeClass = 'badge-urgent';
    label = 'Urgent';
    icon = '🟠';
  }

  return (
    <div 
      className={`severity-badge ${badgeClass}`} 
      title={`Calculated ATSS: ${formattedScore}`}
    >
      <span className="badge-icon">{icon}</span>
      <span className="badge-label">{label}</span>
      <span className="badge-score">({formattedScore})</span>
    </div>
  );
};

export default SeverityBadge;