import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';

// --- Layout & CSS ---
import './App.css';
import Layout from './components/Layout';

// --- Pages ---
import Dashboard from './pages/Dashboard';
import PatientQueue from './pages/PatientQueue';
import TriageForm from './pages/TriageForm';
import ShiftReport from './pages/ShiftReport';
import PublicMonitor from './pages/PublicMonitor';

function App() {
  const { isConnected } = useSocket();

  return (
    <BrowserRouter>
      <Routes>
        {/* NURSE PORTAL */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="queue" element={<PatientQueue />} />
          <Route path="triage" element={<TriageForm />} />
          <Route path="reports" element={<ShiftReport />} />
        </Route>

        {/* PUBLIC KIOSK */}
        <Route path="/monitor" element={<PublicMonitor />} />

        {/* REDIRECTS */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
