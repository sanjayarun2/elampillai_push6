import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Shops from './pages/Shops';
import PushNotificationPrompt from './components/PushNotificationPrompt';

// Lazy load Blog pages for better initial load performance
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Marketplace = lazy(() => import('./pages/Marketplace'));

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="max-w-[888px] mx-auto px-4 py-8 flex justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/shops" element={<Shops />} />
              {/* FIX: Priority routing for blog IDs to ensure social media crawlers fetch correct metadata */}
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/blog/*" element={<Blog />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <PushNotificationPrompt />
      </div>
    </ErrorBoundary>
  );
}

export default App;