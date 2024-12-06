import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationButton() {
  const { permission, subscription, loading, requestPermission } = usePushNotifications();
  const [error, setError] = useState<string>('');

  const handleSubscribe = async () => {
    try {
      setError('');
      await requestPermission();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to notifications');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  if (loading) {
    return (
      <button className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed">
        <Bell className="h-5 w-5 mr-2" />
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm mb-2">
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      className={`inline-flex items-center px-4 py-2 ${
        subscription
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white rounded-lg transition-colors`}
      disabled={loading}
    >
      {subscription ? (
        <>
          <BellOff className="h-5 w-5 mr-2" />
          Unsubscribe from Notifications
        </>
      ) : (
        <>
          <Bell className="h-5 w-5 mr-2" />
          Subscribe to Notifications
        </>
      )}
    </button>
  );
}