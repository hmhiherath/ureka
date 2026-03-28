import React, { useMemo } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { queue, isConnected } = useSocket();

  // useMemo ensures we only recalculate these statistics when the queue actually changes,
  // saving processing power on the tablet.
  const stats = useMemo(() => {
    const total = queue.length;
    const escalated = queue.filter(p => p.escalated).length;
    const critical = queue.filter(p => p.severity_score >= 100).length;
    
    // Calculate Average Wait Time safely (avoid dividing by zero)
    const totalWaitMins = queue.reduce((sum, p) => sum + (p.wait_time_mins || 0), 0);
    const avgWait = total > 0 ? Math.round(totalWaitMins / total) : 0;
    
    // Find the longest wait time
    const longestWait = queue.length > 0 
      ? Math.max(...queue.map(p => p.wait_time_mins || 0)) 
      : 0;

    return { total, escalated, critical, avgWait, longestWait };
  }, [queue]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>ER Operations Overview</h2>
        {!isConnected && (
          <div className="connection-warning">
            ⚠️ System Offline - Reconnecting...
          </div>
        )}
      </header>

      {/* --- Key Metrics Grid --- */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Waiting</h3>
          <div className="metric-value">{stats.total}</div>
          <p className="metric-subtext">Patients in Queue</p>
        </div>

        <div className="metric-card warning">
          <h3>Critical & Urgent</h3>
          <div className="metric-value text-danger">{stats.critical}</div>
          <p className="metric-subtext">ATSS Score &gt; 100</p>
        </div>

        <div className="metric-card escalated">
          <h3>System Escalations</h3>
          <div className="metric-value text-warning">{stats.escalated}</div>
          <p className="metric-subtext">Priority automatically bumped</p>
        </div>

        <div className="metric-card">
          <h3>Wait Times</h3>
          <div className="metric-value">{stats.avgWait} <small>min</small></div>
          <p className="metric-subtext">Avg (Max: {stats.longestWait} min)</p>
        </div>
      </div>

      {/* --- Quick Actions & Top Queue --- */}
      <div className="dashboard-split">
        <div className="quick-actions panel">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/admin/triage" className="btn btn-primary">
              ➕ New Patient Intake
            </Link>
            <Link to="/admin" className="btn btn-secondary">
              📋 Manage Live Queue
            </Link>
            <Link to="/admin/reports" className="btn btn-outline">
              📝 Generate Shift Report
            </Link>
          </div>
        </div>

        <div className="next-up panel">
          <h3>Next to be Treated</h3>
          {queue.length > 0 ? (
            <div className="next-patient-preview">
              <div className="preview-header">
                <span className="id-badge">#{queue[0].id}</span>
                <h4>{queue[0].name}</h4>
              </div>
              <div className="preview-details">
                <p><strong>ATSS Score:</strong> {queue[0].severity_score.toFixed(1)}</p>
                <p><strong>Primary Symptoms:</strong> {queue[0].symptoms.join(', ')}</p>
                <p><strong>Waiting:</strong> {queue[0].wait_time_mins} mins</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>The queue is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;