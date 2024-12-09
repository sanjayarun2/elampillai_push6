import { supabase } from '../lib/supabase';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      // Safely extract keys
      const authKey = subscription.getKey('auth');
      const p256dhKey = subscription.getKey('p256dh');

      if (!authKey || !p256dhKey) {
        throw new Error('Missing subscription keys (auth or p256dh)');
      }

      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));

      // Get device info
      const ua = navigator.userAgent;
      const deviceType = /mobile|tablet|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
      const browser = /chrome|firefox|safari|edge|opera/i.exec(ua)?.[0] || 'Unknown';
      const os = /windows|mac|linux|android|ios/i.exec(ua)?.[0] || 'Unknown';

      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth,
          p256dh,
          user_agent: ua,
          device_type: deviceType,
          browser,
          os,
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
      if (!subscriptions?.length) throw new Error('No active subscriptions found');

      let successCount = 0;
      const errors = [];

      await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            const payload = {
              title: 'New Blog Post',
              body: title,
              icon: '/icon-192x192.png',
              tag: `blog-${blogId}`,
              data: { url: `/blog/${blogId}` }
            };

            const response = await fetch('/api/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
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

            if (!response.ok) throw new Error('Failed to send notification');

            await supabase.from('notification_logs').insert({
              subscription_id: sub.id,
              title: payload.title,
              body: payload.body,
              status: 'success'
            });

            await supabase
              .from('push_subscriptions')
              .update({ last_used: new Date().toISOString() })
              .eq('id', sub.id);

            successCount++;
          } catch (error) {
            errors.push(error);
            console.error('Error sending to subscription:', error);
            await supabase.from('notification_logs').insert({
              subscription_id: sub.id,
              title: 'New Blog Post',
              body: title,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            await supabase.from('push_subscriptions').update({ active: false }).eq('id', sub.id);
          }
        })
      );

      return { success: successCount > 0, totalSent: successCount, errors };
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
};
