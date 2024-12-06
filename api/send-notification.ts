import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, payload } = req.body;

    // Configure web-push with VAPID details
    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      process.env.VITE_VAPID_PUBLIC_KEY!,
      process.env.VITE_VAPID_PRIVATE_KEY!
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