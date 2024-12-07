import { supabase } from '../lib/supabase';

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

      // Send notifications in parallel
      await Promise.all(subscriptions.map(async (sub) => {
        try {
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                tag: `blog-${blogId}`,
                data: {
                  url: `/blog/${blogId}`
                },
                vibrate: [200, 100, 200],
                requireInteraction: true
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
            .eq('id', sub.id);

          successCount++;
        } catch (error) {
          errors.push(error);
          console.error('Error sending to subscription:', error);

          // If failed, mark subscription as inactive
          await supabase
            .from('push_subscriptions')
            .update({ active: false })
            .eq('id', sub.id);
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