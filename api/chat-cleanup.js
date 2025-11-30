const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Cron-Secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Security: Only allow requests with cron secret
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { rowCount } = await sql`
      DELETE FROM chat_messages 
      WHERE timestamp < NOW() - INTERVAL '24 hours'
    `;
    
    return res.status(200).json({ 
      success: true,
      cleanedUp: rowCount,
      message: `Purged ${rowCount} old messages`,
      timestamp: new Date().toISOString() 
    });
    
  } catch (error) {
    console.error('Cleanup Error:', error);
    return res.status(500).json({ error: `Cleanup failed: ${error.message}` });
  }
};
