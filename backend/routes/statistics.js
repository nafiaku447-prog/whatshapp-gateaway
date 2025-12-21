const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get total messages sent today
        const messagesResult = await query(
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 ELSE 0 END) as sent
             FROM messages
             WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE`,
            [req.user.userId]
        );

        // Get total devices
        const devicesResult = await query(
            `SELECT COUNT(*) as total,
                    SUM(CASE WHEN status = 'connected' THEN 1 ELSE 0 END) as connected
             FROM devices
             WHERE user_id = $1 AND is_active = true`,
            [req.user.userId]
        );

        // Get total contacts
        const contactsResult = await query(
            `SELECT COUNT(*) as total FROM contacts WHERE user_id = $1`,
            [req.user.userId]
        );

        res.json({
            stats: {
                messages: {
                    total: parseInt(messagesResult.rows[0].total),
                    sent: parseInt(messagesResult.rows[0].sent)
                },
                devices: {
                    total: parseInt(devicesResult.rows[0].total),
                    connected: parseInt(devicesResult.rows[0].connected)
                },
                contacts: {
                    total: parseInt(contactsResult.rows[0].total)
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
