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

    // Register service worker in both dev and prod
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('ServiceWorker registered successfully:', registration);
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