import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';

const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; // Ensure this is in your .env

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      
      // OPTIONAL: If sub exists locally, ensure it's synced to DB
      if (sub) {
        await subscriptionService.save(sub);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  async function requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await subscribeToPush();
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // 1. Check if already subscribed to avoid duplicates
      let sub = await registration.pushManager.getSubscription();

      // 2. If not, create new subscription
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
        });
      }

      setSubscription(sub);
      
      // 3. Save to DB (Service handles deduplication)
      await subscriptionService.save(sub);
      
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
            await sub.unsubscribe();
            // Remove from DB
            await subscriptionService.delete(sub.endpoint);
            setSubscription(null);
        }
    } catch (error) {
        console.error('Error unsubscribing:', error);
    }
  }

  return { permission, subscription, loading, requestPermission, unsubscribeFromPush };
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  if (!base64String) return new Uint8Array();
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}