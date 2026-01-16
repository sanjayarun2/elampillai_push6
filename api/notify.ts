import { VercelRequest, VercelResponse } from '@vercel/node';

// NOTE: We do NOT import libraries at the top. 
// We import them inside the function to prevent "Start-up Crashes".

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 2. DYNAMIC IMPORTS (Safely loads libraries)
    // This prevents the "Function Invocation Failed" crash
    const webpush = await import('web-push');
    const { createClient } = await import('@libsql/client');

    // 3. CHECK VARIABLES
    const dbUrl = process.env.VITE_TURSO_URL;     
    const dbToken = process.env.VITE_TURSO_TOKEN; 
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    const missing = [];
    if (!dbUrl) missing.push('VITE_TURSO_URL');
    if (!dbToken) missing.push('VITE_TURSO_TOKEN');
    if (!publicKey) missing.push('VITE_VAPID_PUBLIC_KEY');
    if (!privateKey) missing.push('VITE_VAPID_PRIVATE_KEY');

    if (missing.length > 0) {
      throw new Error(`MISSING VARIABLES: ${missing.join(', ')}`);
    }

    // 4. CONNECT TO DB & SETUP KEYS
    const turso = createClient({
      url: dbUrl!,
      authToken: dbToken!,
    });

    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      publicKey!,
      privateKey!
    );

    // 5. FETCH & SEND
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found.' });
    }

    const { title, message, url, image } = req.body;
    const payload = JSON.stringify({
      title: title || 'Elampillai News',
      body: message || 'New update available.',
      url: url || '/',
      image: image || null
    });

    let successCount = 0;
    const promises = subscriptions.map(async (sub: any) => {
      try {
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
        await webpush.sendNotification({ endpoint: sub.endpoint, keys }, payload);
        successCount++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await turso.execute({
            sql: 'DELETE FROM subscriptions WHERE endpoint = ?',
            args: [sub.endpoint]
          });
        }
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ success: true, sent: successCount });

  } catch (error: any) {
    console.error('CRASH REPORT:', error);
    // This will now show the REAL error in your browser Response tab
    return res.status(500).json({ 
      error: 'Server Execution Failed', 
      details: error.message,
      stack: error.stack 
    });
  }
}