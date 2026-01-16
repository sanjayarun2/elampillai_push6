import { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@libsql/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Checks if the request is NOT a POST (prevents "Method Not Allowed" confusion)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use the "Send Notification" button.' });
  }

  try {
    // 2. Setup Variables INSIDE the function (Prevents silent crashes)
    const dbUrl = process.env.VITE_TURSO_DB_URL;
    const dbToken = process.env.VITE_TURSO_DB_TOKEN;
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    // Check specifically which key is missing
    const missingKeys = [];
    if (!dbUrl) missingKeys.push('VITE_TURSO_DB_URL');
    if (!dbToken) missingKeys.push('VITE_TURSO_DB_TOKEN');
    if (!publicKey) missingKeys.push('VITE_VAPID_PUBLIC_KEY');
    if (!privateKey) missingKeys.push('VITE_VAPID_PRIVATE_KEY');

    if (missingKeys.length > 0) {
      throw new Error(`MISSING ENV VARIABLES: ${missingKeys.join(', ')}`);
    }

    // 3. Setup Database Connection
    const turso = createClient({
      url: dbUrl!,
      authToken: dbToken!,
    });

    // 4. Setup VAPID
    try {
      webpush.setVapidDetails(
        'mailto:admin@elampillai.in',
        publicKey!,
        privateKey!
      );
    } catch (err: any) {
      throw new Error(`VAPID Key Error: ${err.message}`);
    }

    // 5. Fetch Subscribers
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found in database.' });
    }

    // 6. Send Notifications
    const { title, message, url, image } = req.body;
    
    const payload = JSON.stringify({
      title: title || 'News Update',
      body: message || 'Check out the latest news.',
      url: url || '/',
      image: image || null
    });

    const promises = subscriptions.map(async (sub: any) => {
      try {
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
        await webpush.sendNotification({ endpoint: sub.endpoint, keys }, payload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Cleaning dead sub: ${sub.endpoint}`);
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
    console.error('API Error:', error);
    // This will now return the EXACT error to your Network Tab
    return res.status(500).json({ 
      error: 'Server Error', 
      details: error.message 
    });
  }
}