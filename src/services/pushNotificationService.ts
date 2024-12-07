import { supabase } from '../lib/supabase';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      console.log('Saving subscription:', subscription); // Log the subscription

      // Extract user agent details
      const ua = navigator.userAgent || 'xxxx'; // Fallback if user agent is missing
      const deviceType = /mobile|tablet|ipad/i.test(ua) ? 'Mobile' : 'Desktop';
      const browser = /chrome|firefox|safari|edge|opera/i.exec(ua)?.[0] || 'Unknown';
      const os = /windows|mac|linux|android|ios/i.exec(ua)?.[0] || 'Unknown';

      // Get IP address via a public API (fallback to 'xxxx' if unavailable)
      const ipAddress = await getIPAddress() || 'xxxx';

      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            endpoint: subscription.endpoint,
            auth: subscription.keys.auth || 'xxxx',
            p256dh: subscription.keys.p256dh || 'xxxx',
            user_agent: ua,
            device_type: deviceType,
            browser: browser,
            os: os,
            ip_address: ipAddress,
            created_at: new Date().toISOString(),
            active: true
          },
          {
            onConflict: 'endpoint' // Ensure the endpoint is unique
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error saving subscription to Supabase:', error);
        throw error;
      }

      console.log('Subscription saved successfully:', data); // Log successful save
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
          const payload = {
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

          if (!response.ok) {
            throw new Error('Failed to send notification');
          }

          // Log successful notification
          await supabase.from('notification_logs').insert({
            subscription_id: sub.id,
            title: payload.title,
            body: payload.body,
            status: 'success'
          });

          // Update last_used timestamp
          await supabase
            .from('push_subscriptions')
            .update({ last_used: new Date().toISOString() })
            .eq('id', sub.id);

          successCount++;
        } catch (error) {
          errors.push(error);
          console.error('Error sending to subscription:', error);

          // Log failed notification
          await supabase.from('notification_logs').insert({
            subscription_id: sub.id,
            title: 'New Blog Post',
            body: title,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });

          // Mark subscription as inactive if it failed
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

// Function to get IP address (you can use a public API to get the IP address)
async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'xxxx'; // Return 'xxxx' if IP address can't be fetched
  }
}
