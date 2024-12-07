import { supabase } from '../lib/supabase';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      console.log('Saving subscription:', subscription); // Log the subscription

      // Save only required fields (id, auth, p256dh, created_at, active)
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,      // Only auth and p256dh keys
          p256dh: subscription.keys.p256dh,  // Only p256dh key
          created_at: new Date().toISOString(), // created_at as current timestamp
          active: true                        // Set active to true
        }, {
          onConflict: 'endpoint'  // Use endpoint as the unique key
        })
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
        .eq('active', true);  // Fetch active subscriptions

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
