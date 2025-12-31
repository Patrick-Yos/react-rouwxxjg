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
        // GET - Fetch all donations
        if (req.method === 'GET') {
            const { rows } = await sql`SELECT * FROM donations ORDER BY id DESC`;

            // Calculate total from the donations
            const total = rows.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);

            return res.json({ donations: rows, total });
        }

        // POST - Create a new donation
        if (req.method === 'POST') {
            const { name, amount, message, date } = req.body;

            // Validate required fields
            if (!name || !amount || amount <= 0) {
                return res.status(400).json({
                    error: 'Name and valid amount are required'
                });
            }

            // Insert the donation and return the ID
            const result = await sql`
        INSERT INTO donations (name, amount, message, date)
        VALUES (${name}, ${amount}, ${message || ''}, ${date})
        RETURNING id
      `;

            // Get updated total
            const { rows: totalResult } = await sql`SELECT SUM(amount) as total FROM donations`;

            return res.json({
                success: true,
                id: result.rows[0].id,
                newTotal: parseFloat(totalResult[0].total) || 0
            });
        }
    } catch (error) {
        console.error('Donations API Error:', error);
        return res.status(500).json({
            error: `Database error: ${error.message}`
        });
    }
};
