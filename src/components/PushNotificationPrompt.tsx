import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { permission, loading, requestPermission } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show prompt immediately on first visit
    if (!loading && permission === 'default' && !localStorage.getItem('notificationPromptShown')) {
      setShowPrompt(true);
      localStorage.setItem('notificationPromptShown', 'true');
    }
  }, [loading, permission]);

  const handleEnableNotifications = async () => {
    try {
      setError(null);
      await requestPermission();
      setShowPrompt(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading || permission !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full animate-pulse">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          எங்கள் செய்திகளை பெற
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Get instant updates from Elampillai Community. Stay informed about local news, events, and announcements.
        </p>
        {error && (
          <div className="text-red-600 text-sm text-center mb-4 animate-fade-in">
            {error}
          </div>
        )}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleEnableNotifications}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transform transition-all duration-200 hover:scale-105 active:scale-95 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enable Notifications
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors focus:outline-none"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}