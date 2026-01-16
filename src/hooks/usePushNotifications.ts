import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';

// Ensure we have a string, even if env is missing, to prevent crashes
const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''; 

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // 1. Check if browser supports notifications
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      console.warn("Push Notifications are not supported in this browser (e.g., DuckDuckGo/Brave)");
      setSupported(false);
      setLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      
      // Sync with Turso if sub exists (Ensures DB is always up to date)
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
    if (!supported) {
      alert("This browser does not support Web Notifications. Please use Chrome or Samsung Internet.");
      return;
    }

    // Request permission from user
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await subscribeToPush();
    }
  }

  async function subscribeToPush() {
    try {
      if (!PUBLIC_KEY) {
        throw new Error('VAPID Public Key is missing in environment variables.');
      }

      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();

      // If no subscription exists, create one
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
        });
      }

      setSubscription(sub);
      // Save to Turso Database
      await subscriptionService.save(sub);
      
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to enable notifications. Please try again.');
      throw error;
    }
  }

  async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
            // 1. Unsubscribe from browser
            await sub.unsubscribe();
            // 2. Remove from Turso Database
            await subscriptionService.delete(sub.endpoint);
            setSubscription(null);
        }
    } catch (error) {
        console.error('Error unsubscribing:', error);
    }
  }

  return { permission, subscription, loading, requestPermission, unsubscribeFromPush, supported };
}

// Helper to convert VAPID key
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