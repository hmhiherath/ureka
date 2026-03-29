import React from 'react';

const SeverityBadge = ({ score }) => {
  const getLevel = (s) => {
    if (s >= 80) return { label: 'CRITICAL', color: '#ef4444', bg: '#fef2f2' };
    if (s >= 50) return { label: 'URGENT', color: '#f59e0b', bg: '#fffbeb' };
    return { label: 'STABLE', color: '#10b981', bg: '#ecfdf5' };
  };

  const { label, color, bg } = getLevel(score);

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '800',
      letterSpacing: '0.5px',
      color: color,
      backgroundColor: bg,
      border: `1px solid ${color}`,
      display: 'inline-block'
    }}>
      {label}
    </span>
  );
};

export default SeverityBadge;
