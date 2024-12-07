import { supabase } from '../lib/supabase';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

// Fixed VAPID keys
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      // Parse user agent for device info
      const ua = navigator.userAgent;
      const deviceType = /mobile|tablet|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
      const browser = /chrome|firefox|safari|edge|opera/i.exec(ua)?.[0] || 'Unknown';
      const os = /windows|mac|linux|android|ios/i.exec(ua)?.[0] || 'Unknown';

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          ip_address: ipData.ip,
          user_agent: ua,
          device_type: deviceType,
          browser: browser,
          os: os,
          created_at: new Date().toISOString(),
          active: true
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
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

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
        .eq('active', true)
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
      // Create notification record
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert([{
          blog_id: blogId,
          title: title,
          status: 'processing',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (notifError) throw notifError;

      // Get active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('active', true);

      if (subError) throw subError;
      if (!subscriptions?.length) {
        throw new Error('No active subscriptions found');
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

          // Log success
          await supabase.from('notification_logs').insert([{
            notification_id: notification.id,
            subscription_id: sub.id,
            status: 'success'
          }]);

          // Update subscription last_used
          await supabase
            .from('push_subscriptions')
            .update({ last_used: new Date().toISOString() })
            .eq('id', sub.id);

          successCount++;
        } catch (error) {
          // Log error
          await supabase.from('notification_logs').insert([{
            notification_id: notification.id,
            subscription_id: sub.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }]);

          errors.push(error);
          console.error('Error sending to subscription:', error);
        }
      }));

      // Update notification status
      await supabase
        .from('notifications')
        .update({
          status: successCount > 0 ? 'completed' : 'failed',
          sent_count: successCount,
          error_count: errors.length,
          processed_at: new Date().toISOString()
        })
        .eq('id', notification.id);

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