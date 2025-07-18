// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard/App';
// (Optionnel) tes global styles :
// import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
