import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID keys
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';
const VAPID_PRIVATE_KEY = 'gxL8WTYEv_Hm1FSjJcgWxDlhF2Lx2BpQKHOPXPgrRHY';

webpush.setVapidDetails(
  'mailto:admin@elampillai.in',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, payload } = req.body;

    console.log('Received subscription:', subscription);
    console.log('Received payload:', payload);

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('Invalid subscription data:', subscription);
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    if (!payload || !payload.title || !payload.body) {
      console.error('Invalid payload data:', payload);
      return res.status(400).json({ error: 'Missing or invalid payload' });
    }

    // Debug: Fetch subscriptions from Supabase
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')  // Fetch all subscriptions
      .eq('active', true); // You can filter by active subscriptions

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError.message);
      return res.status(500).json({ error: 'Error fetching subscriptions', details: fetchError.message });
    }

    // Log the subscriptions to confirm fetching is working
    console.log('Fetched Subscriptions:', subscriptions);

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      await logNotification(subscription.endpoint, payload, 'success');
      return res.status(200).json({ success: true });
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
      await logNotification(subscription.endpoint, payload, 'failed', pushError.message);
      return res.status(500).json({ error: 'Failed to send notification', details: pushError.message });
    }
  } catch (error) {
    console.error('Unexpected server error:', error);
    return res.status(500).json({ error: 'Unexpected server error', details: error.message });
  }
}

async function logNotification(endpoint: string, payload: any, status: string, error: string | null = null) {
  const { error: logError } = await supabase.from('notification_logs').insert({
    subscription_id: endpoint,
    title: payload.title,
    body: payload.body,
    status,
    error,
    created_at: new Date().toISOString(),
  });

  if (logError) {
    console.error('Error logging notification:', logError.message);
  }
}
