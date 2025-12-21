const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all contacts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, name, phone_number, email, tags, created_at
             FROM contacts
             WHERE user_id = $1
             ORDER BY name ASC`,
            [req.user.userId]
        );

        res.json({ contacts: result.rows });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

module.exports = router;
