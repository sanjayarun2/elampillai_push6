import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, payload, vapidKeys } = req.body;

    if (!vapidKeys?.publicKey || !vapidKeys?.privateKey) {
      throw new Error('Missing VAPID keys');
    }

    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      vapidKeys.publicKey,
      vapidKeys.privateKey
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