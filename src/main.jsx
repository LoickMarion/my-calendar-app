// main.jsx
// Standard Vite React entry point

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Ensure your index.html has <div id="root"></div>
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
