import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';

const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY; 

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
      
      // Ensure sync on load
      if (sub) await subscriptionService.save(sub);
      
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  async function requestPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      await subscribeToPush();
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
        });
      }

      setSubscription(sub);
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
            await subscriptionService.delete(sub.endpoint);
            setSubscription(null);
        }
    } catch (error) {
        console.error('Error unsubscribing:', error);
    }
  }

  return { permission, subscription, loading, requestPermission, unsubscribeFromPush };
}

function urlBase64ToUint8Array(base64String: string) {
  if (!base64String) return new Uint8Array();
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}