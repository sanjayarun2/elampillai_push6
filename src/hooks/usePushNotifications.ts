import { useState, useEffect } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

// Fixed VAPID public key
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Check the initial permission and subscription status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Ensure that both Notification API and Service Worker API are supported
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          setLoading(false);
          return;
        }

        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();

          if (existingSubscription) {
            setSubscription(existingSubscription);
            console.log('Existing subscription found:', existingSubscription);
          } else {
            console.log('No existing subscription found.');
          }
        }
      } catch (err) {
        console.error('Error checking notification permission:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, []);

  // Request permission from the user to enable notifications
  const requestPermission = async () => {
    try {
      setLoading(true);

      // Ensure browser supports push notifications and service workers
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Push notifications are not supported in this browser');
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      console.log('Notification permission:', permission);

      if (permission === 'granted') {
        // Register the service worker if not already registered
        const registration = await navigator.serviceWorker.ready;

        // Unsubscribe from the existing subscription if any
        const currentSubscription = await registration.pushManager.getSubscription();
        if (currentSubscription) {
          await currentSubscription.unsubscribe();
        }

        // Create a new push subscription
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        console.log('New subscription created:', newSubscription);

        // Save the subscription to the backend
        await pushNotificationService.saveSubscription(newSubscription);

        setSubscription(newSubscription);

        // Show a welcome notification after the subscription is created
        new Notification('Notifications Enabled', {
          body: 'You will now receive updates from Elampillai Community',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'welcome-notification',
          vibrate: [200, 100, 200],
        });
      } else {
        console.log('User denied notification permission');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    subscription,
    loading,
    requestPermission,
  };
}

// Utility function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
