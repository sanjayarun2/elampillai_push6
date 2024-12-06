import { useState, useEffect } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

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
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Push notifications are not supported in this browser');
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error('VAPID public key is missing');
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        await pushNotificationService.saveSubscription(subscription);
        setSubscription(subscription);
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      throw err;
    }
  };

  return {
    permission,
    subscription,
    loading,
    requestPermission
  };
}