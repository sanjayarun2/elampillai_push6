import { supabase } from '../lib/supabase';

// Fixed VAPID keys
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';
const VAPID_PRIVATE_KEY = 'gxL8WTYEv_Hm1FSjJcgWxDlhF2Lx2BpQKHOPXPgrRHY';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      // Get device info
      const ua = navigator.userAgent;
      const deviceType = /mobile|tablet|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
      const browser = /chrome|firefox|safari|edge|opera/i.exec(ua)?.[0] || 'Unknown';
      const os = /windows|mac|linux|android|ios/i.exec(ua)?.[0] || 'Unknown';

      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          user_agent: ua,
          device_type: deviceType,
          browser: browser,
          os: os,
          created_at: new Date().toISOString(),
          active: true
        }, {
          onConflict: 'endpoint'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  async sendNotification(blogId: string, title: string) {
    try {
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

      await Promise.all(subscriptions.map(async (sub) => {
        try {
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${VAPID_PRIVATE_KEY}`
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
                renotify: true,
                requireInteraction: true
              }
            })
          });

          if (!response.ok) {
            throw new Error('Failed to send notification');
          }

          // Log successful notification
          await supabase.from('notification_logs').insert({
            subscription_id: sub.id,
            notification_type: 'blog_post',
            status: 'success'
          });

          // Update last_used timestamp
          await supabase
            .from('push_subscriptions')
            .update({ last_used: new Date().toISOString() })
            .eq('id', sub.id);

          successCount++;
        } catch (error) {
          // Log failed notification
          await supabase.from('notification_logs').insert({
            subscription_id: sub.id,
            notification_type: 'blog_post',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });

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
  }
};