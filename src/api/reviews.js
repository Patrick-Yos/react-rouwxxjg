import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM reviews ORDER BY id`;
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to load reviews' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      // Check review count (rough 500KB limit)
      const { rows: countResult } = await sql`SELECT COUNT(*) as count FROM reviews`;
      if (countResult[0].count >= 1000) {
        return res.status(413).json({ 
          error: 'Storage limit reached! Cannot add more reviews.' 
        });
      }

      const { name, rating, comment, date } = req.body;
      await sql`
        INSERT INTO reviews (name, rating, comment, date)
        VALUES (${name}, ${rating}, ${comment}, ${date})
      `;
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save review' });
    }
  }
}