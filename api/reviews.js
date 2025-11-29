const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM reviews ORDER BY id`;
      return res.json(rows);
    }
    
    if (req.method === 'POST') {
      const { name, rating, comment, date } = req.body;
      
      // Check review count (rough 500KB limit)
      const { rows: countResult } = await sql`SELECT COUNT(*) as count FROM reviews`;
      if (countResult[0].count >= 1000) {
        return res.status(413).json({ 
          error: 'Storage limit reached! Cannot add more reviews.' 
        });
      }

      // Insert and RETURN the auto-generated ID
      const result = await sql`
        INSERT INTO reviews (name, rating, comment, date)
        VALUES (${name}, ${rating}, ${comment}, ${date})
        RETURNING id
      `;
      
      return res.json({ 
        success: true, 
        id: result.rows[0].id // Send the DB-generated ID back to frontend
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: `Database error: ${error.message}` 
    });
  }
};
