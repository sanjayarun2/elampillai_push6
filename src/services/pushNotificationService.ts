import { supabase } from '../lib/supabase';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

// Fixed VAPID keys - these should match your Vercel environment variables
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          ip_address: ipData.ip,
          user_agent: navigator.userAgent,
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

  async getAllSubscriptionsWithDetails() {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  },

  async sendNotification(blogId: string, title: string) {
    try {
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (error) throw error;
      if (!subscriptions?.length) {
        throw new Error('No push subscriptions found');
      }

      let successCount = 0;
      const errors = [];

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
              payload: {
                title: 'New Blog Post',
                body: title,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                data: {
                  url: `/blog/${blogId}`
                },
                tag: `blog-${blogId}`,
                requireInteraction: true,
                vibrate: [200, 100, 200]
              }
            })
          });

          if (!response.ok) {
            throw new Error('Failed to send notification');
          }

          // Update last_used timestamp
          await supabase
            .from('push_subscriptions')
            .update({ last_used: new Date().toISOString() })
            .eq('endpoint', sub.endpoint);

          successCount++;
        } catch (error) {
          errors.push(error);
          console.error('Error sending to subscription:', error);
        }
      }));

      return { 
        success: successCount > 0,
        totalSent: successCount,
        errors: errors.length > 0 ? errors : null
      };
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
};