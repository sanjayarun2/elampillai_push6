import { supabase } from '../lib/supabase';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  async getSubscriptionCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting subscription count:', error);
      return 0;
    }
  },

  async getAllSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  },

  async sendNotification(blogId: string, title: string) {
    try {
      const subscriptions = await this.getAllSubscriptions();
      
      if (!subscriptions.length) {
        throw new Error('No push subscriptions found');
      }

      // Record notification in database
      await supabase
        .from('notifications')
        .insert([{
          blog_id: blogId,
          title: title,
          status: 'sent',
          processed_at: new Date().toISOString()
        }]);

      // Send notification through web-push
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const vapidPrivateKey = import.meta.env.VITE_VAPID_PRIVATE_KEY;

      if (!vapidPublicKey || !vapidPrivateKey) {
        throw new Error('Missing VAPID keys');
      }

      const payload = {
        title: 'New Blog Post',
        body: title,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: `/blog/${blogId}`
        }
      };

      // Send to all subscriptions
      await Promise.all(subscriptions.map(async (sub) => {
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
              payload,
              vapidKeys: {
                publicKey: vapidPublicKey,
                privateKey: vapidPrivateKey
              }
            })
          });

          if (!response.ok) {
            throw new Error('Failed to send notification');
          }
        } catch (error) {
          console.error('Error sending notification to subscription:', error);
        }
      }));

      return { success: true };
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
};