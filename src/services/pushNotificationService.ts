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
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
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
  }
};