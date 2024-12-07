import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VITE_VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID keys');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { subscription, payload } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    if (!payload) {
      return res.status(400).json({ error: 'Missing payload' });
    }

    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}