const express = require('express');
const router = express.Router();

// Webhook routes placeholder
router.get('/', (req, res) => {
    res.json({ message: 'Webhooks endpoint' });
});

module.exports = router;
