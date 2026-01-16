import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
// REMOVED: import { initializeDatabase } from './lib/supabase-init'; 
import App from './App';
import './index.css';

// 1. REGISTER SERVICE WORKER (Robust PWA Support)
// This ensures notifications and offline features work on mobile & desktop
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Forces the browser to check for updates immediately
    })
    .then((registration) => {
      console.log('SW Registered:', registration.scope);
    })
    .catch((error) => {
      console.error('SW Registration Failed:', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <SettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SettingsProvider>
    </HelmetProvider>
  </StrictMode>
);