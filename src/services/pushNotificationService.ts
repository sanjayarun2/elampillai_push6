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
          active: true,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'endpoint'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving subscription:', error);
      // Check if error is an instance of Error
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Unknown error');
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
        console.warn('No active subscriptions found');
        return { success: false, totalSent: 0, errors: ['No active subscriptions'] };
      }

      const notificationResults = await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            const payload = {
              title: 'New Blog Post',
              body: title,
              icon: '/icon-192x192.png',
              tag: `blog-${blogId}`,
              data: { 
                url: `/blog/${blogId}`,
                timestamp: new Date().toISOString()
              }
            };

            let response;
            try {
              response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
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
            } catch (fetchError) {
              console.error('Fetch error:', fetchError);
              if (fetchError instanceof Error) {
                throw new Error(fetchError.message);
              }
              throw new Error('Network error');
            }

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Notification send failed:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
              });
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            await supabase.from('notification_logs').insert({
              subscription_id: sub.id,
              title: payload.title,
              body: payload.body,
              status: 'success',
              blog_id: blogId
            });

            await supabase
              .from('push_subscriptions')
              .update({ 
                last_used: new Date().toISOString(),
                last_successful: new Date().toISOString()
              })
              .eq('id', sub.id);

            return { 
              subscriptionId: sub.id, 
              status: 'success' 
            };
          } catch (error) {
            console.error('Error processing subscription:', {
              subscriptionId: sub.id,
              endpoint: sub.endpoint,
              error: error instanceof Error ? error.message : 'Unknown error'
            });

            await supabase.from('notification_logs').insert({
              subscription_id: sub.id,
              title: 'New Blog Post',
              body: title,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
              blog_id: blogId
            });

            await supabase
              .from('push_subscriptions')
              .update({ 
                active: false, 
                last_error: new Date().toISOString() 
              })
              .eq('id', sub.id);

            return { 
              subscriptionId: sub.id, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const successfulNotifications = notificationResults.filter(
        result => result.status === 'success'
      );

      return {
        success: successfulNotifications.length > 0,
        totalSent: successfulNotifications.length,
        results: notificationResults
      };
    } catch (error) {
      console.error('Critical error in sendNotification:', error);
      return {
        success: false,
        totalSent: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
};
