import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID keys for Web Push Notifications
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || 'BPEly9cl_r5b3Fr7PMlqtMQQDkJ4gh99NjaeuNoi52cdsF0wGGuQlrI8HB9tXUTzpOPfq5-1R5rbgsOtZIgIrSw';
const VAPID_PRIVATE_KEY = process.env.VITE_VAPID_PRIVATE_KEY || 'UauxE6eRdVLxAJGJ8negG_JRtKVeg1wxIk_HzzycAMI';

// Log the VAPID keys to verify
console.log('VAPID_PUBLIC_KEY:', VAPID_PUBLIC_KEY);
console.log('VAPID_PRIVATE_KEY:', VAPID_PRIVATE_KEY);

// Set the VAPID details for web push
try {
  webpush.setVapidDetails(
    'mailto:admin@elampillai.in',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('VAPID keys successfully configured');
} catch (error) {
  console.error('Error setting VAPID keys:', error);
}

// Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Robust CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.error('Invalid request method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);

    const { subscription, payload } = req.body;

    if (!subscription) {
      console.error('Missing subscription');
      return res.status(400).json({ error: 'Subscription object is missing' });
    }

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      console.error('Incomplete subscription keys');
      return res.status(400).json({ error: 'Invalid subscription keys' });
    }

    if (!payload?.title || !payload?.body) {
      console.error('Invalid payload');
      return res.status(400).json({ error: 'Payload must contain title and body' });
    }

    console.log('Attempting to send notification');
    const pushResult = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      },
      JSON.stringify(payload)
    );

    console.log('Notification sent successfully');
    await logNotification(subscription.endpoint, payload, 'success');

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      response: pushResult,
    });
  } catch (error) {
    console.error('Push notification error:', error);

    await logNotification(
      subscription?.endpoint || '',
      payload,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return res.status(500).json({
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Helper function to log notification results in Supabase
async function logNotification(endpoint: string, payload: any, status: string, error: string | null = null) {
  try {
    const { error: logError } = await supabase.from('notification_logs').insert({
      subscription_id: endpoint,
      title: payload?.title || 'Unknown',
      body: payload?.body || 'Unknown',
      status,
      error,
      created_at: new Date().toISOString(),
    });

    if (logError) {
      console.error('Error logging notification:', logError.message);
    }
  } catch (insertError) {
    console.error('Unexpected error during notification logging:', insertError);
  }
}
