import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // We will make sure this exists in the next step!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
