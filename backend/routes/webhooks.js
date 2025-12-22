const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios'); // Requires axios, check if installed. If not, maybe use fetch (node 18+) or install axios.

// Check if axios is installed
try {
    require.resolve('axios');
} catch (e) {
    console.warn('Axios not found, webhook delivery might fail if not using fetch.');
    // Note: User can run 'npm install axios'
}

// Initialize tables
const initTable = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS webhooks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                url TEXT NOT NULL,
                events TEXT[],
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Ensure one webhook per user for simplicity as per UI? Or allow multiple?
        // UI implies single form. Let's assume single config per user for now, or just get the first one.
        console.log('✅ Webhooks table initialized');
    } catch (error) {
        console.error('❌ Failed to init webhooks table:', error);
    }
};

initTable();

// Get webhook config
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM webhooks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [req.user.userId]
        );
        res.json(result.rows[0] || null); // Return null if not set
    } catch (error) {
        console.error('Get webhook error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Save/Update webhook config
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { url, events, is_active } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Check if exists
        const check = await query(
            `SELECT id FROM webhooks WHERE user_id = $1 LIMIT 1`,
            [req.user.userId]
        );

        let result;
        if (check.rows.length > 0) {
            // Update
            result = await query(
                `UPDATE webhooks 
                 SET url = $1, events = $2, is_active = $3, updated_at = NOW()
                 WHERE user_id = $4
                 RETURNING *`,
                [url, events || [], is_active !== false, req.user.userId]
            );
        } else {
            // Create
            result = await query(
                `INSERT INTO webhooks (user_id, url, events, is_active)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [req.user.userId, url, events || [], is_active !== false]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Save webhook error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Test Webhook
router.post('/test', authenticateToken, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const payload = {
            event: 'test.ping',
            data: {
                message: 'This is a test webhook from WA API',
                timestamp: new Date().toISOString()
            }
        };

        // Use fetch (Node 18+) or axios
        // Start by assuming users env has fetch or I verify axios usage.
        // Let's use fetch as it is native in newer Node.

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                return res.status(response.status).json({
                    error: `Webhook returned ${response.status} ${response.statusText}`
                });
            }

            const text = await response.text();
            res.json({ message: 'Success', status: response.status, response: text });

        } catch (fetchError) {
            return res.status(502).json({ error: 'Failed to reach webhook URL: ' + fetchError.message });
        }

    } catch (error) {
        console.error('Test webhook error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
