// main.jsx
// Standard Vite React entry point

import React from 'react';
import { createRoot } from 'react-dom/client';
import {GoogleOAuthProvider} from '@react-oauth/google'
import App from './App';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!CLIENT_ID) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set (see .env.example) — Google sign-in will not work.');
}
// Ensure your index.html has <div id="root"></div>
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
