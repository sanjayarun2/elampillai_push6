import { createClient } from '@libsql/client/web';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Blog ID is required' });
  }

  try {
    const db = createClient({
      url: process.env.VITE_TURSO_URL || '',
      authToken: process.env.VITE_TURSO_TOKEN || '',
    });

    const result = await db.execute({
      sql: "SELECT * FROM blogs WHERE id = ?",
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}