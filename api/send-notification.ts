import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID keys for Web Push Notifications
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VITE_VAPID_PRIVATE_KEY!;

// Set the VAPID details for web push
webpush.setVapidDetails(
  'mailto:admin@elampillai.in',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // More robust CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Support both POST and GET methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body based on request method
    const body = req.method === 'POST' 
      ? req.body 
      : req.query;

    const { subscription, payload } = body;

    // Log received subscription and payload for debugging
    console.log('Received subscription:', subscription);
    console.log('Received payload:', payload);

    // Validate subscription data
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      console.error('Invalid subscription data:', subscription);
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Validate payload data
    if (!payload || !payload.title || !payload.body) {
      console.error('Invalid payload data:', payload);
      return res.status(400).json({ error: 'Missing or invalid payload' });
    }

    // Fetch active subscriptions from Supabase
    const { data: subscriptionsFromDb, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('active', true);

    // Log the result of fetching subscriptions from the database
    if (fetchError) {
      console.error('Error fetching subscriptions from Supabase:', fetchError.message);
      return res.status(500).json({ error: 'Error fetching subscriptions from Supabase', details: fetchError.message });
    }

    console.log('Fetched active subscriptions from Supabase:', subscriptionsFromDb);

    // Send the push notification using the subscription received from the client
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      // Log successful notification
      await logNotification(subscription.endpoint, payload, 'success');
      return res.status(200).json({ success: true });
    } catch (pushError) {
      console.error('Error sending push notification:', pushError);
      // Log failed notification
      await logNotification(subscription.endpoint, payload, 'failed', pushError.message);
      return res.status(500).json({ error: 'Failed to send notification', details: pushError.message });
    }
  } catch (error) {
    console.error('Unexpected server error:', error);
    return res.status(500).json({ error: 'Unexpected server error', details: error.message });
  }
}

// Helper function to log notification status in Supabase
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
  } else {
    console.log('Notification logged successfully');
  }
}