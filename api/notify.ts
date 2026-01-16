import { VercelRequest, VercelResponse } from '@vercel/node';
import * as webpush from 'web-push'; // FIX: Changed import style
import { createClient } from '@libsql/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers (Allow request from your website)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 2. DEBUG: Check if Variables exist (Does not show values, just Yes/No)
    const dbUrl = process.env.VITE_TURSO_DB_URL;
    const dbToken = process.env.VITE_TURSO_DB_TOKEN;
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    if (!dbUrl) throw new Error('Missing Env: VITE_TURSO_DB_URL');
    if (!dbToken) throw new Error('Missing Env: VITE_TURSO_DB_TOKEN');
    if (!publicKey) throw new Error('Missing Env: VITE_VAPID_PUBLIC_KEY');
    if (!privateKey) throw new Error('Missing Env: VAPID_PRIVATE_KEY');

    // 3. Connect to Database
    const turso = createClient({
      url: dbUrl,
      authToken: dbToken,
    });

    // 4. Setup Notification Keys
    try {
      webpush.setVapidDetails(
        'mailto:admin@elampillai.in',
        publicKey,
        privateKey
      );
    } catch (keyError: any) {
      throw new Error(`VAPID Key Error: ${keyError.message}`);
    }

    const { title, message, url, image } = req.body;

    // 5. Get Subscribers
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found in database.' });
    }

    // 6. Send Notifications
    const payload = JSON.stringify({
      title: title || 'Elampillai News',
      body: message || 'New update available.',
      url: url || '/',
      image: image || null
    });

    const promises = subscriptions.map(async (sub: any) => {
      try {
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
        await webpush.sendNotification({ endpoint: sub.endpoint, keys }, payload);
      } catch (err: any) {
        // Cleanup dead users
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Cleaning up dead sub: ${sub.endpoint}`);
          await turso.execute({
            sql: 'DELETE FROM subscriptions WHERE endpoint = ?',
            args: [sub.endpoint]
          });
        }
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ success: true, count: subscriptions.length });

  } catch (error: any) {
    console.error('API CRASH:', error);
    // Returns the ACTUAL error message to your browser console instead of just "500"
    return res.status(500).json({ 
      error: 'Server Error', 
      details: error.message 
    });
  }
}