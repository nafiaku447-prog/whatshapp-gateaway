const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Send message
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { deviceId, recipient, message, messageType = 'text' } = req.body;

        // Validation
        if (!deviceId || !recipient || !message) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Device ID, recipient, and message are required'
            });
        }

        // Create message record
        const result = await query(
            `INSERT INTO messages (user_id, device_id, recipient_phone, message_type, content, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING id, status, created_at`,
            [req.user.userId, deviceId, recipient, messageType, message]
        );

        res.status(201).json({
            message: 'Message queued successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: ' to queue message' });
    }
});

// Get message history
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, recipient_phone, message_type, content, status, created_at
             FROM messages
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 100`,
            [req.user.userId]
        );

        res.json({ messages: result.rows });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;
