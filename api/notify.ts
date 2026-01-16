import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // 2. DYNAMIC IMPORTS (Fix for "is not a function" error)
    // We grab the 'default' export which contains setVapidDetails
    const { default: webpush } = await import('web-push');
    const { createClient } = await import('@libsql/client');

    // 3. CHECK VARIABLES
    const dbUrl = process.env.VITE_TURSO_URL;
    const dbToken = process.env.VITE_TURSO_TOKEN;
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    if (!dbUrl || !dbToken) throw new Error('MISSING DATABASE CREDENTIALS (TURSO)');
    if (!publicKey || !privateKey) throw new Error('MISSING VAPID KEYS');

    // 4. VERIFY DATABASE (Running this FIRST as you asked)
    console.log("Connecting to Database...");
    const turso = createClient({ url: dbUrl, authToken: dbToken });
    
    // We try to fetch subscribers immediately to prove DB connection works
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    console.log(`Database connected! Found ${subscriptions.length} subscribers.`);

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'Database connected, but no subscribers found.' });
    }

    // 5. SETUP VAPID (Only runs if DB check passed)
    try {
      webpush.setVapidDetails(
        'mailto:admin@elampillai.in',
        publicKey,
        privateKey
      );
    } catch (err: any) {
      throw new Error(`VAPID SETUP FAILED: ${err.message}`);
    }

    // 6. PREPARE & SEND
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

    return res.status(200).json({ 
      success: true, 
      db_status: "Connected",
      total_subscribers: subscriptions.length,
      sent_count: successCount 
    });

  } catch (error: any) {
    console.error('API CRASH:', error);
    return res.status(500).json({ 
      error: 'Server Error', 
      details: error.message 
    });
  }
}