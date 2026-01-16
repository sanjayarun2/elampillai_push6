import { VercelRequest, VercelResponse } from '@vercel/node';

// DO NOT import web-push here. It causes the 500 crash.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // 2. LOAD LIBRARIES SAFELY (Dynamic Import)
    // This fixes the "Function Invocation Failed" error
    const webpush = await import('web-push');
    const { createClient } = await import('@libsql/client');

    // 3. GET VARIABLES (Checks for VITE_ version automatically)
    const dbUrl = process.env.VITE_TURSO_URL;
    const dbToken = process.env.VITE_TURSO_TOKEN;
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    
    // This line makes your current setup work:
    const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    if (!dbUrl || !dbToken || !publicKey || !privateKey) {
      throw new Error('MISSING VARIABLES: Check VITE_TURSO_URL, VITE_TURSO_TOKEN, and VITE_VAPID_PRIVATE_KEY');
    }

    // 4. CONNECT & SETUP
    const turso = createClient({ url: dbUrl, authToken: dbToken });
    
    webpush.setVapidDetails(
      'mailto:admin@elampillai.in',
      publicKey,
      privateKey
    );

    // 5. SEND NOTIFICATION
    const { title, message, url, image } = req.body;
    
    // Fetch Subscribers
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers.' });
    }

    const payload = JSON.stringify({
      title: title || 'Elampillai Update',
      body: message || 'New notification',
      url: url || '/',
      image: image || null
    });

    // Send loop
    const promises = subscriptions.map(async (sub: any) => {
      try {
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
        await webpush.sendNotification({ endpoint: sub.endpoint, keys }, payload);
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
    return res.status(200).json({ success: true, count: subscriptions.length });

  } catch (error: any) {
    console.error('CRASH:', error);
    // This returns the REAL error message to your browser
    return res.status(500).json({ 
      error: 'Server Error', 
      details: error.message 
    });
  }
}