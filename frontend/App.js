import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Layout & CSS ---
import './App.css';
import Layout from './components/Layout';

// --- Nurse Tablet Pages (Admin) ---
import Dashboard from './pages/Dashboard';
import PatientQueue from './pages/PatientQueue';
import TriageForm from './pages/TriageForm';
import ShiftReport from './pages/ShiftReport';

// --- Public Kiosk Page (Monitor) ---
import PublicMonitor from './pages/PublicMonitor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* 1. THE NURSE TABLET ROUTES 
          Everything inside this Route is wrapped by the <Layout /> component,
          meaning the Sidebar and Top Navigation will always be visible.
        */}
        <Route path="/admin" element={<Layout />}>
          {/* Default /admin route loads the Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Sub-routes for the specific tools */}
          <Route path="queue" element={<PatientQueue />} />
          <Route path="triage" element={<TriageForm />} />
          <Route path="reports" element={<ShiftReport />} />
        </Route>

        {/* 2. THE PATIENT MONITOR ROUTE 
          This sits OUTSIDE the <Layout /> wrapper. It takes up the entire 
          screen and is designed for the waiting room TVs.
        */}
        <Route path="/monitor" element={<PublicMonitor />} />

        {/* 3. FALLBACK REDIRECTS 
          If someone types a bad URL, or goes to the root (localhost:3000/), 
          send them to the public monitor by default for safety.
        */}
        <Route path="/" element={<Navigate to="/monitor" replace />} />
        <Route path="*" element={<Navigate to="/monitor" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;