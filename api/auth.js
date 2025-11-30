const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-vercel-env';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { username, password } = req.body;
      
      const { rows } = await sql`
        SELECT id, username, password_hash FROM users WHERE username = ${username}
      `;
      
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid cosmic credentials' });
      }
      
      const user = rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid cosmic credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({ 
        success: true, 
        user: { id: user.id, username: user.username },
        token 
      });
    }
    
    if (req.method === 'GET') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Not authenticated' });
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({ user: decoded });
      } catch {
        return res.status(401).json({ error: 'Invalid session token' });
      }
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
};
