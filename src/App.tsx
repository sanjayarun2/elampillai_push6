import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Shops from './pages/Shops';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Marketplace from './pages/Marketplace';
import PushNotificationPrompt from './components/PushNotificationPrompt';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <PushNotificationPrompt />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;