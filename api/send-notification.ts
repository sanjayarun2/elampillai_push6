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
  // Robust CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the raw body to log everything for debugging
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));

    const { subscription, payload } = req.body;

    // Extensive subscription validation with detailed error messages
    if (!subscription) {
      console.error('No subscription object provided');
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: 'Subscription object is missing' 
      });
    }

    // Check each critical subscription field with detailed validation
    if (!subscription.endpoint) {
      console.error('Subscription is missing endpoint');
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: 'Subscription endpoint is required' 
      });
    }

    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      console.error('Subscription keys are incomplete', subscription.keys);
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: 'Subscription requires p256dh and auth keys' 
      });
    }

    // Validate payload data
    if (!payload || !payload.title || !payload.body) {
      console.error('Invalid payload data:', payload);
      return res.status(400).json({ 
        error: 'Invalid payload', 
        details: 'Payload must contain title and body' 
      });
    }

    // Attempt to send notification
    try {
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

      // Log successful notification
      await logNotification(subscription.endpoint, payload, 'success');

      return res.status(200).json({ 
        success: true, 
        message: 'Notification sent successfully' 
      });

    } catch (pushError) {
      console.error('Push notification error:', pushError);
      
      // Log failed notification with detailed error
      await logNotification(
        subscription.endpoint, 
        payload, 
        'failed', 
        pushError instanceof Error ? pushError.message : 'Unknown push error'
      );

      return res.status(500).json({ 
        error: 'Failed to send notification', 
        details: pushError instanceof Error ? pushError.message : 'Unknown error' 
      });
    }

  } catch (error) {
    console.error('Unexpected server error:', error);
    return res.status(500).json({ 
      error: 'Unexpected server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Helper function to log notification status in Supabase
async function logNotification(endpoint: string, payload: any, status: string, error: string | null = null) {
  try {
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
  } catch (insertError) {
    console.error('Unexpected error during notification logging:', insertError);
  }
}