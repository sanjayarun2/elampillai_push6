import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      const subData = subscription.toJSON();
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subData.keys?.auth || '',
          p256dh: subData.keys?.p256dh || '',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  async sendNotification(blogId: string, title: string) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      
      if (!subscriptions.length) {
        throw new Error('No push subscriptions found');
      }

      const payload = {
        title: 'Elampillai News',
        body: title,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: `/blog/${blogId}`
        },
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: `blog-${blogId}`,
        renotify: true,
        timestamp: Date.now()
      };

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            const response = await fetch('/api/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscription: {
                  endpoint: sub.endpoint,
                  keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh
                  }
                },
                payload
              })
            });

            if (!response.ok) {
              throw new Error('Failed to send notification');
            }

            return { success: true, endpoint: sub.endpoint };
          } catch (error) {
            console.error('Error sending notification:', error);
            return { success: false, endpoint: sub.endpoint, error };
          }
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      return { 
        success: successCount > 0,
        totalSent: successCount,
        totalFailed: results.length - successCount
      };
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  },

  // ... rest of the service methods remain the same
};