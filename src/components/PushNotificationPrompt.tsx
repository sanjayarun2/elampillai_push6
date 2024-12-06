import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { permission, loading, requestPermission } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a short delay if not already granted
    if (!loading && permission !== 'granted') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, permission]);

  if (loading || permission === 'granted' || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-center mb-4">
          <Bell className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          எங்கள் செய்திகளை பெற
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Get instant updates from Elampillai Community. Stay informed about local news, events, and announcements.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={requestPermission}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Enable Notifications
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}