const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      // Fetch messages from last 24 hours
      const { rows } = await sql`
        SELECT id, username, text, timestamp 
        FROM chat_messages 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        ORDER BY timestamp ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { username, text } = req.body;
      
      if (!username || !text) {
        return res.status(400).json({ error: 'Missing username or text' });
      }

      const { rows } = await sql`
        INSERT INTO chat_messages (username, text) 
        VALUES (${username}, ${text}) 
        RETURNING id, username, text, timestamp
      `;
      
      return res.status(201).json(rows[0]);
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
};
