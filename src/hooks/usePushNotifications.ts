import { useState, useEffect } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          setSubscription(existingSubscription);

          // Refresh subscription in Supabase only if new or updated subscription is found
          if (existingSubscription) {
            console.log('Refreshing subscription:', existingSubscription);
            await pushNotificationService.saveSubscription(existingSubscription);
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

  const requestPermission = async () => {
    try {
      setLoading(true);

      const permission = await Notification.requestPermission();
      setPermission(permission);

      // If permission granted, subscribe the user to push notifications
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        });

        console.log('New subscription:', newSubscription);
        await pushNotificationService.saveSubscription(newSubscription);
        setSubscription(newSubscription);

        new Notification('Notifications Enabled', {
          body: 'You will now receive updates from the community.',
          icon: '/icon-192x192.png',
          tag: 'welcome-notification',
        });
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't show the notification prompt if permission is already granted or denied
  const shouldShowPrompt = permission === 'default';

  return { permission, subscription, loading, requestPermission, shouldShowPrompt };
}
