import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs'; 
import { ShopEditor } from './ShopEditor';
import { BlogEditor } from './BlogEditor';
import { MarketplaceEditor } from './MarketplaceEditor';
// REMOVED: SettingsEditor import to prevent Supabase errors
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ADMIN_PASSWORD = 'elampillai2024';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Required state for Controlled Tabs
  const [activeTab, setActiveTab] = useState('shops');
  
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('adminAuthenticated');
              setIsAuthenticated(false);
              navigate('/');
            }}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
        
        {/* FIX: Added defaultValue="shops" to satisfy type requirements */}
        <Tabs defaultValue="shops">
          <TabsList activeTab={activeTab} setActiveTab={setActiveTab}>
            <TabsTrigger value="shops" activeTab={activeTab} setActiveTab={setActiveTab}>Shops</TabsTrigger>
            <TabsTrigger value="blog" activeTab={activeTab} setActiveTab={setActiveTab}>Blog</TabsTrigger>
            <TabsTrigger value="marketplace" activeTab={activeTab} setActiveTab={setActiveTab}>Marketplace</TabsTrigger>
            {/* REMOVED: Settings Tab Trigger */}
          </TabsList>

          <TabsContent value="shops" activeTab={activeTab}>
            <ShopEditor />
          </TabsContent>

          <TabsContent value="blog" activeTab={activeTab}>
            <BlogEditor />
          </TabsContent>

          <TabsContent value="marketplace" activeTab={activeTab}>
            <MarketplaceEditor />
          </TabsContent>

          {/* REMOVED: Settings Tab Content */}
        </Tabs>
      </div>
    </div>
  );
}