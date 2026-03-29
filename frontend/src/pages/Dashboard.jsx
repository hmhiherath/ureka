import React from 'react';

const StatCard = ({ label, value, color }) => (
  <div style={{ 
    background: '#fff', 
    padding: '25px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0',
    flex: 1,
    margin: '0 10px'
  }}>
    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
      {label}
    </div>
    <div style={{ fontSize: '32px', fontWeight: '800', color: color }}>
      {value}
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 -10px 30px' }}>
        <StatCard label="Active Cases" value="12" color="#1e293b" />
        <StatCard label="Critical (Red)" value="2" color="#ef4444" />
        <StatCard label="Avg Wait Time" value="18m" color="#1e293b" />
        <StatCard label="Staff on Duty" value="6" color="#1e293b" />
      </div>
      
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#1e293b' }}>System Status</h3>
        <p style={{ color: '#64748b' }}>Max-Heap Algorithm active. Database synced with PostgreSQL container.</p>
      </div>
    </div>
  );
};

export default Dashboard;
