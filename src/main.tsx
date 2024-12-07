import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { initializeDatabase } from './lib/supabase-init';
import App from './App';
import './index.css';

// Initialize database and register service worker
async function initialize() {
  try {
    await initializeDatabase();

    if ('serviceWorker' in navigator && !import.meta.env.DEV) {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('ServiceWorker registered successfully');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

initialize();

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