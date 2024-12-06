import React from 'react';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const { permission, loading, requestPermission } = usePushNotifications();

  if (loading || permission === 'granted') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Bell className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            எங்கள் செய்திகளை பெற
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get instant updates from Elampillai Community
          </p>
          <div className="mt-3">
            <button
              onClick={requestPermission}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}