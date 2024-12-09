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

    console.log('Received subscription:', subscription);  // Log received subscription
    console.log('Received payload:', payload);  // Log received payload

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('Invalid subscription data:', subscription);
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    if (!payload || !payload.title || !payload.body) {
      console.error('Invalid payload data:', payload);
      return res.status(400).json({ error: 'Missing or invalid payload' });
    }

    // Fetch active subscriptions from Supabase
    const { data: subscriptionsFromDb, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('active', true);  // Only fetch active subscriptions

    if (fetchError) {
      console.error('Error fetching subscriptions from Supabase:', fetchError.message);
      return res.status(500).json({ error: 'Error fetching subscriptions from Supabase', details: fetchError.message });
    }

    console.log('Fetched active subscriptions from Supabase:', subscriptionsFromDb);  // Log the fetched subscriptions

    // Send the push notification using the subscription received from the client
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
    subscription_id: endpoint,  // Store the endpoint as the unique identifier
    title: payload.title,
    body: payload.body,
    status,
    error,
    created_at: new Date().toISOString(),
  });

  if (logError) {
    console.error('Error logging notification:', logError.message);
  } else {
    console.log('Notification logged successfully');  // Log success when notification is logged
  }
}
