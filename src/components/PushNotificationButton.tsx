import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationButton() {
  const { permission, subscription, loading, requestPermission, unsubscribeFromPush } = usePushNotifications();
  const [error, setError] = useState<string>('');

  const handleClick = async () => {
    try {
      setError('');
      if (subscription) {
        await unsubscribeFromPush();
      } else {
        await requestPermission();
      }
    } catch (err) {
      setError('Action failed. Please check site permissions.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

  if (loading) {
    return (
      <button className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-wait" disabled>
        <Bell className="h-5 w-5 mr-2 animate-pulse" />
        Loading...
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={permission === 'denied'}
        className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          subscription ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {subscription ? (
          <>
            <BellOff className="h-5 w-5 mr-2" />
            Unsubscribe
          </>
        ) : (
          <>
            <Bell className="h-5 w-5 mr-2" />
            Get Notifications
          </>
        )}
      </button>
      
      {error && <div className="text-red-600 text-sm animate-fade-in">{error}</div>}
      
      {permission === 'denied' && (
        <div className="text-amber-600 text-xs mt-2">
          Notifications are blocked. Reset permissions in browser settings.
        </div>
      )}
    </div>
  );
}