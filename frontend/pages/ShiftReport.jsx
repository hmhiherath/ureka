import React, { useState, useEffect, useMemo } from 'react';
import SeverityBadge from '../components/SeverityBadge';

const ShiftReport = () => {
  const [treatedPatients, setTreatedPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the historical data when the component mounts
  useEffect(() => {
    const fetchShiftReport = async () => {
      try {
        // We use a standard REST fetch for historical reports, not WebSockets
        const response = await fetch('http://localhost:5000/api/reports/shift');
        
        if (!response.ok) {
          throw new Error('Failed to fetch shift report data');
        }
        
        const data = await response.json();
        setTreatedPatients(data.patients);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShiftReport();
  }, []);

  // Calculate Shift Statistics using useMemo for performance
  const stats = useMemo(() => {
    if (!treatedPatients || treatedPatients.length === 0) return null;

    const total = treatedPatients.length;
    const maxScore = Math.max(...treatedPatients.map(p => p.severity_score));
    const escalatedCount = treatedPatients.filter(p => p.escalated).length;

    return { total, maxScore, escalatedCount };
  }, [treatedPatients]);

  // Handle printing the report
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="loading-spinner">Loading Shift Data...</div>;
  if (error) return <div className="error-banner">Error: {error}</div>;

  return (
    <div className="shift-report-container">
      
      {/* --- Report Header --- */}
      <header className="report-header">
        <div className="report-branding">
          <h2>End of Shift Summary Report</h2>
          <p className="report-date">
            Generated: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="report-actions no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </button>
        </div>
      </header>

      {/* --- Shift Statistics --- */}
      {stats ? (
        <div className="report-stats-grid">
          <div className="stat-box">
            <h4>Total Patients Treated</h4>
            <span className="stat-number">{stats.total}</span>
          </div>
          <div className="stat-box">
            <h4>Highest ATSS Score Handled</h4>
            <span className="stat-number text-danger">{stats.maxScore.toFixed(1)}</span>
          </div>
          <div className="stat-box">
            <h4>Automated Escalations</h4>
            <span className="stat-number text-warning">{stats.escalatedCount}</span>
          </div>
        </div>
      ) : (
        <div className="empty-state">No patients treated during this shift yet.</div>
      )}

      {/* --- Detailed Patient Log --- */}
      {treatedPatients.length > 0 && (
        <div className="report-table-wrapper">
          <h3 className="table-title">Treated Patient Log</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Time Arrived</th>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Primary Symptoms</th>
                <th>Final ATSS</th>
                <th>Escalated</th>
              </tr>
            </thead>
            <tbody>
              {treatedPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{new Date(patient.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td>#{patient.id}</td>
                  <td><strong>{patient.name}</strong></td>
                  <td className="symptoms-cell">
                    {/* Convert array to string safely */}
                    {Array.isArray(patient.symptoms) ? patient.symptoms.join(', ') : patient.symptoms}
                  </td>
                  <td>
                    <SeverityBadge score={patient.severity_score} />
                  </td>
                  <td>
                    {patient.escalated ? <span className="badge-warning">Yes</span> : <span className="text-muted">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShiftReport;