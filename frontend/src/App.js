import React from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <Layout>
        {/* The entire application now lives inside this single Command Center component */}
        <Dashboard />
      </Layout>
    </div>
  );
}

export default App;