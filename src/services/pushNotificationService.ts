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
      // Get client IP using multiple fallback services
      let ipAddress = null;
      try {
        const responses = await Promise.any([
          fetch('https://api.ipify.org?format=json'),
          fetch('https://api.ip.sb/ip'),
          fetch('https://api.myip.com')
        ]);
        const data = await responses.json();
        ipAddress = data.ip || data;
      } catch (error) {
        console.warn('Could not fetch IP address:', error);
      }

      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        });

      if (upsertError) throw upsertError;

      // Show welcome notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive updates from Elampillai Community',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'welcome',
          vibrate: [200, 100, 200]
        });
      }

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
        .select('endpoint, auth, p256dh');

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
          // Remove invalid subscriptions
          if (error.message.includes('subscription expired')) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
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