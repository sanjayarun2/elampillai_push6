import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

// Fixed VAPID keys - these should match the ones in pushNotificationService.ts
const VAPID_PUBLIC_KEY = 'BLBz5HXVYJGwDh_jRzQqwuOzuMRpO9F9YU_pEYX-FKPpOxLXjBvbXxS-kKXK0LVqLvqzPX4DgTDzBL5H3tQlwXo';
const VAPID_PRIVATE_KEY = 'gxL8WTYEv_Hm1FSjJcgWxDlhF2Lx2BpQKHOPXPgrRHY';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, payload } = req.body;

    // Validate the request
    if (!subscription || !payload) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Configure web-push
    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // Send the notification
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