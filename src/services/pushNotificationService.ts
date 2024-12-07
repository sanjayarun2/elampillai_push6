import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';

export const pushNotificationService = {
  async saveSubscription(subscription: PushSubscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.toJSON().keys.auth,
          p256dh: subscription.toJSON().keys.p256dh,
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
      const { error: insertError } = await supabase
        .from('notifications')
        .insert([{
          blog_id: blogId,
          title: title,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      const payload = {
        title: 'Elampillai News',
        body: title,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: `/blog/${blogId}`
        },
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: `blog-${blogId}`,
        renotify: true
      };

      // Send to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
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
                  publicKey: VAPID_PUBLIC_KEY
                }
              })
            });

            if (!response.ok) {
              throw new Error('Failed to send notification');
            }

            // Update notification status
            await supabase
              .from('notifications')
              .update({ 
                status: 'sent', 
                processed_at: new Date().toISOString() 
              })
              .eq('blog_id', blogId);

            return { success: true, endpoint: sub.endpoint };
          } catch (error) {
            console.error('Error sending notification to subscription:', error);
            return { success: false, endpoint: sub.endpoint, error };
          }
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      return { 
        success: successCount > 0,
        totalSent: successCount,
        totalFailed: results.length - successCount
      };
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error;
    }
  }
};