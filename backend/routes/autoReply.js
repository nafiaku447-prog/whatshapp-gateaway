const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');



// Get all rules
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM auto_replies WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get rules error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Create rule
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { keyword, match_type, response, reply_to, is_active } = req.body;

        const result = await query(
            `INSERT INTO auto_replies (user_id, keyword, match_type, response, reply_to, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.userId, keyword, match_type || 'exact', response, reply_to || 'all', is_active !== false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create rule error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update rule
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { keyword, match_type, response, reply_to, is_active } = req.body;

        const result = await query(
            `UPDATE auto_replies 
             SET keyword = $1, match_type = $2, response = $3, reply_to = $4, is_active = $5, updated_at = NOW()
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [keyword, match_type, response, reply_to, is_active, req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update rule error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Delete rule
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `DELETE FROM auto_replies WHERE id = $1 AND user_id = $2 RETURNING id`,
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
        console.error('Delete rule error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Toggle status
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `UPDATE auto_replies 
             SET is_active = NOT is_active, updated_at = NOW()
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rule not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Toggle rule error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
