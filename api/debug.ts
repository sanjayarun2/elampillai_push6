import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Check all possible variable names
  const envCheck = {
    TURSO_URL: process.env.VITE_TURSO_URL ? "✅ OK" : "❌ MISSING",
    TURSO_TOKEN: process.env.VITE_TURSO_TOKEN ? "✅ OK" : "❌ MISSING",
    
    // Check both spellings for VAPID Private Key
    VAPID_PRIVATE_VITE: process.env.VITE_VAPID_PRIVATE_KEY ? "✅ OK" : "❌ MISSING",
    VAPID_PRIVATE_PLAIN: process.env.VAPID_PRIVATE_KEY ? "✅ OK" : "❌ MISSING",
    
    VAPID_PUBLIC: process.env.VITE_VAPID_PUBLIC_KEY ? "✅ OK" : "❌ MISSING",
  };

  // 2. Return the report
  return res.status(200).json({
    status: "Debug Report",
    variables: envCheck,
    node_version: process.version
  });
}