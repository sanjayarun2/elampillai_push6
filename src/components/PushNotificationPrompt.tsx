import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { permission, loading, requestPermission } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show if fully loaded, permission is default (not granted/denied), and not already shown session
    if (!loading && permission === 'default' && !sessionStorage.getItem('hidePushPrompt')) {
      const timer = setTimeout(() => setShowPrompt(true), 3000); // Delay 3s
      return () => clearTimeout(timer);
    }
  }, [loading, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    sessionStorage.setItem('hidePushPrompt', 'true'); // Don't show again this session
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-5 z-50 border border-gray-100 animate-slide-up">
      <button onClick={handleClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X size={18} />
      </button>
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-full shrink-0">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Enable Notifications?</h3>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Get instant updates about local news and events.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleEnable}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Allow
            </button>
            <button
              onClick={handleClose}
              className="text-gray-500 text-sm px-3 py-2 hover:bg-gray-50 rounded-lg"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}