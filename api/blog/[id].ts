import { turso } from '../../src/lib/turso';

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  try {
    const result = await turso.execute({
      sql: "SELECT * FROM blogs WHERE id = ?",
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}