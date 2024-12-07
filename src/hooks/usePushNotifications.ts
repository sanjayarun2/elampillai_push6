import { useState, useEffect } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

// Fixed VAPID public key
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          setLoading(false);
          return;
        }

        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          setSubscription(existingSubscription);
        }
      } catch (err) {
        console.error('Error checking notification permission:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async () => {
    try {
      setLoading(true);

      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Push notifications are not supported in this browser');
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // Unsubscribe from existing subscription if any
        const currentSubscription = await registration.pushManager.getSubscription();
        if (currentSubscription) {
          await currentSubscription.unsubscribe();
        }

        // Create new subscription
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY
        });

        await pushNotificationService.saveSubscription(newSubscription);
        setSubscription(newSubscription);

        // Show welcome notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive updates from Elampillai Community',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'welcome-notification',
          vibrate: [200, 100, 200]
        });
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
    requestPermission
  };
}