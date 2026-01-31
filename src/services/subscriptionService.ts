import { turso, isTursoConfigured } from '../lib/turso';

export interface Subscription {
  id: number;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at: string;
}

export const subscriptionService = {
  // Save or Update subscription (Prevents duplicates)
  async save(subscription: PushSubscription) {
    const { endpoint, keys } = subscription.toJSON();
    
    if (!endpoint || !keys) {
        return { success: false, error: 'Invalid subscription data' };
    }

    try {
      if (!isTursoConfigured()) {
        console.warn('Database not configured');
        return { success: false, error: 'Database not configured' };
      }
      
      await turso.execute({
        sql: `INSERT INTO subscriptions (endpoint, keys) VALUES (?, ?) 
              ON CONFLICT(endpoint) DO UPDATE SET keys = ?, created_at = CURRENT_TIMESTAMP`,
        args: [endpoint, JSON.stringify(keys), JSON.stringify(keys)],
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving subscription:', error);
      return { success: false, error };
    }
  },

  // Get all subscriptions
  async getAll(): Promise<Subscription[]> {
    try {
      if (!isTursoConfigured()) {
        return [];
      }
      
      const result = await turso.execute('SELECT * FROM subscriptions ORDER BY created_at DESC');
      return result.rows.map(row => ({
        id: row.id as number,
        endpoint: row.endpoint as string,
        keys: JSON.parse(row.keys as string),
        created_at: row.created_at as string
      }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  },

  // Get count
  async getCount(): Promise<number> {
    try {
      if (!isTursoConfigured()) {
        return 0;
      }
      
      const result = await turso.execute('SELECT COUNT(*) as count FROM subscriptions');
      return Number(result.rows[0].count);
    } catch (error) {
      return 0;
    }
  },

  // Delete
  async delete(idOrEndpoint: number | string) {
    try {
      if (!isTursoConfigured()) {
        return false;
      }
      
      if (typeof idOrEndpoint === 'number') {
        await turso.execute({
          sql: 'DELETE FROM subscriptions WHERE id = ?',
          args: [idOrEndpoint],
        });
      } else {
        await turso.execute({
          sql: 'DELETE FROM subscriptions WHERE endpoint = ?',
          args: [idOrEndpoint],
        });
      }
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  }
};