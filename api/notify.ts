import { VercelRequest, VercelResponse } from '@vercel/node';
import * as webpush from 'web-push'; // FIX: Prevents crash in ESM modules
import { createClient } from '@libsql/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. ROBUST CORS HEADERS (Allows requests from your specific domain)
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or use 'https://elampillai.in' for stricter security
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser pre-flight checks
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Ensure only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // 2. LOAD & VALIDATE VARIABLES (Matches your Vercel Settings)
    const dbUrl = process.env.VITE_TURSO_URL;      
    const dbToken = process.env.VITE_TURSO_TOKEN;  
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    // Strict validation to catch configuration errors immediately
    const missingKeys = [];
    if (!dbUrl) missingKeys.push('VITE_TURSO_URL');
    if (!dbToken) missingKeys.push('VITE_TURSO_TOKEN');
    if (!publicKey) missingKeys.push('VITE_VAPID_PUBLIC_KEY');
    if (!privateKey) missingKeys.push('VITE_VAPID_PRIVATE_KEY');

    if (missingKeys.length > 0) {
      // This sends the specific missing key name back to the browser console
      throw new Error(`MISSING ENV VARIABLES: ${missingKeys.join(', ')}`);
    }

    // 3. DATABASE CONNECTION
    const turso = createClient({
      url: dbUrl!,
      authToken: dbToken!,
    });

    // 4. SETUP WEB PUSH
    try {
      webpush.setVapidDetails(
        'mailto:admin@elampillai.in',
        publicKey!,
        privateKey!
      );
    } catch (err: any) {
      throw new Error(`VAPID Configuration Failed: ${err.message}`);
    }

    // 5. FETCH SUBSCRIBERS
    const result = await turso.execute('SELECT * FROM subscriptions');
    const subscriptions = result.rows;

    if (subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found in database.' });
    }

    // 6. PREPARE NOTIFICATION DATA
    const { title, message, url, image } = req.body;
    
    const payload = JSON.stringify({
      title: title || 'Elampillai News',
      body: message || 'New update available.',
      url: url || '/',
      image: image || null
    });

    // 7. SEND TO ALL & CLEANUP DEAD USERS
    let successCount = 0;
    let failCount = 0;

    const promises = subscriptions.map(async (sub: any) => {
      try {
        // Safe parsing of keys (handles both stringified JSON and direct objects)
        const keys = typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys;
        
        await webpush.sendNotification({ endpoint: sub.endpoint, keys }, payload);
        successCount++;
      } catch (err: any) {
        failCount++;
        // If user blocked notifications or uninstalled (410 Gone / 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Cleanup: Removing dead subscription ${sub.id}`);
          await turso.execute({
            sql: 'DELETE FROM subscriptions WHERE endpoint = ?',
            args: [sub.endpoint]
          });
        } else {
          console.error(`Failed to send to ${sub.id}:`, err.statusCode);
        }
      }
    });

    // Wait for all to finish
    await Promise.all(promises);

    return res.status(200).json({ 
      success: true, 
      total: subscriptions.length,
      sent: successCount,
      failed: failCount
    });

  } catch (error: any) {
    console.error('API CRITICAL FAILURE:', error);
    // Returns the EXACT error message to your browser Network tab
    return res.status(500).json({ 
      error: 'Server Error', 
      details: error.message 
    });
  }
}