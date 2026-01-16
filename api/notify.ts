import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@libsql/client';

// 1. Setup Turso Client (Replaces Supabase)
const turso = createClient({
  url: process.env.VITE_TURSO_DB_URL || '',
  authToken: process.env.VITE_TURSO_DB_TOKEN || '',
});

// 2. Setup VAPID Keys
const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY; // Ensure this is in Vercel Env Vars

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      publicKey,
      privateKey
    );
  } catch (err) {
    console.error('VAPID Setup Error:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 3. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, message, url, image } = req.body;

    // 4. FETCH ALL SUBSCRIBERS FROM TURSO
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found.' });
    }

    // 5. PREPARE PAYLOAD
    const payload = JSON.stringify({
      title: title || 'Elampillai News',
      body: message || 'New update available.',
      url: url || '/',
      image: image || null
    });

    // 6. SEND TO EVERYONE (Parallel)
    const promises = subscriptions.map(async (sub: any) => {
      try {
        // Parse keys if stored as string
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;

        const pushConfig = {
          endpoint: sub.endpoint,
          keys: keys
        };

        await webpush.sendNotification(pushConfig, payload);
      } catch (err: any) {
        // 7. CLEANUP DEAD SUBSCRIPTIONS
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Removing dead sub: ${sub.endpoint}`);
          await turso.execute({
            sql: 'DELETE FROM subscriptions WHERE endpoint = ?',
            args: [sub.endpoint]
          });
        }
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ success: true, sent_count: subscriptions.length });

  } catch (error: any) {
    console.error('Notification Error:', error);
    return res.status(500).json({ error: error.message });
  }
}