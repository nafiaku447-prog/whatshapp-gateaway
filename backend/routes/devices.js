const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate, authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');
const whatsappManager = require('../services/whatsappManager');

// Get all devices for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, device_name, phone_number, status, api_token, is_active, last_seen, created_at, qr_code
             FROM devices 
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        // Get real-time status from WhatsApp Manager and sync with database
        const devices = await Promise.all(result.rows.map(async (device) => {
            const managerStatus = whatsappManager.getConnectionStatus(device.id);
            const hasClient = whatsappManager.getClient(device.id);

            // Determine the actual current status
            let actualStatus = device.status;

            if (hasClient && managerStatus) {
                actualStatus = managerStatus;
            } else if (device.status === 'connected' && !hasClient) {
                // Database says connected but no active client - sync to disconnected
                actualStatus = 'disconnected';
            }

            // If status changed, update database
            if (actualStatus !== device.status) {
                console.log(`🔄 Syncing device ${device.id} status: ${device.status} → ${actualStatus}`);

                await query(
                    `UPDATE devices SET status = $1, is_active = $2, updated_at = NOW() WHERE id = $3`,
                    [actualStatus, actualStatus === 'connected', device.id]
                );

                device.status = actualStatus;
                device.is_active = actualStatus === 'connected';
            }

            // Get message count for today
            const messageCount = await query(
                `SELECT COUNT(*) as count 
                 FROM messages 
                 WHERE device_id = $1 
                   AND DATE(created_at) = CURRENT_DATE
                   AND status = 'sent'`,
                [device.id]
            );

            device.messages_today = parseInt(messageCount.rows[0]?.count || 0);

            return device;
        }));

        res.json({
            devices: devices
        });
    } catch (error) {
        console.error('Get devices error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch devices'
        });
    }
});

// Create new device
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { device_name, phone_number } = req.body;

        if (!device_name || !phone_number) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Device name and phone number are required'
            });
        }

        // Generate unique API token
        const apiToken = crypto.randomBytes(32).toString('hex');

        const result = await query(
            `INSERT INTO devices (user_id, device_name, phone_number, api_token)
             VALUES ($1, $2, $3, $4)
             RETURNING id, device_name, phone_number, status, api_token, created_at`,
            [req.user.userId, device_name, phone_number, apiToken]
        );

        res.status(201).json({
            message: 'Device created successfully',
            device: result.rows[0]
        });
    } catch (error) {
        console.error('Create device error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to create device'
        });
    }
});

// Get device by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM devices WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = result.rows[0];

        // Get additional info from WhatsApp Manager if connected
        const deviceInfo = await whatsappManager.getDeviceInfo(device.id);
        if (deviceInfo) {
            device.whatsapp_info = deviceInfo;
        }

        res.json({ device });
    } catch (error) {
        console.error('Get device error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch device'
        });
    }
});

// Connect device (initiate QR scanning) - REAL WhatsApp Integration
router.post('/:id/connect', authenticateToken, async (req, res) => {
    try {
        // First check if device exists and belongs to user
        const checkResult = await query(
            `SELECT id, device_name, phone_number FROM devices WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = checkResult.rows[0];

        // Initialize WhatsApp client - this will trigger QR code generation
        await whatsappManager.initializeClient(
            device.id,
            device.device_name,
            device.phone_number
        );

        res.json({
            message: 'Device initialization started. Please scan the QR code when it appears.',
            device: {
                id: device.id,
                device_name: device.device_name,
                phone_number: device.phone_number,
                status: 'initializing'
            }
        });
    } catch (error) {
        console.error('Connect device error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to connect device: ' + error.message
        });
    }
});

// Disconnect device - REAL WhatsApp Disconnection
router.post('/:id/disconnect', authenticateToken, async (req, res) => {
    try {
        // First check if device exists and belongs to user
        const checkResult = await query(
            `SELECT id FROM devices WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Disconnect from WhatsApp Manager
        await whatsappManager.disconnectDevice(req.params.id);

        res.json({
            message: 'Device disconnected successfully',
            device: {
                id: req.params.id,
                status: 'disconnected'
            }
        });
    } catch (error) {
        console.error('Disconnect device error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to disconnect device: ' + error.message
        });
    }
});

// Delete device - Also cleanup WhatsApp session
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if device exists and belongs to user
        const checkResult = await query(
            `SELECT id FROM devices WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // First disconnect if connected
        try {
            await whatsappManager.disconnectDevice(req.params.id);
        } catch (error) {
            // Continue even if disconnect fails
            console.log('Device was not connected, continuing with deletion');
        }

        // Delete from database
        await query(
            `DELETE FROM devices WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        console.error('Delete device error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to delete device'
        });
    }
});

// Send message endpoint - Supports both API Key and JWT Token
router.post('/:id/send-message', authenticate, async (req, res) => {
    try {
        const { recipient, message } = req.body;

        if (!recipient || !message) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Recipient and message are required'
            });
        }

        // Check if device exists and belongs to user
        const checkResult = await query(
            `SELECT id, status FROM devices WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = checkResult.rows[0];

        // CRITICAL: Convert deviceId to number (Map keys are numbers!)
        const deviceId = parseInt(req.params.id, 10);

        // Check the ACTUAL client status from WhatsAppManager (not just database)
        const actualStatus = whatsappManager.getConnectionStatus(deviceId);
        const hasClient = whatsappManager.getClient(deviceId);

        // If status mismatch, sync database with actual status
        if (device.status === 'connected' && (!hasClient || actualStatus !== 'connected')) {
            await query(
                `UPDATE devices SET status = $1, is_active = false, updated_at = NOW() WHERE id = $2`,
                [actualStatus || 'disconnected', deviceId]
            );

            return res.status(400).json({
                error: 'Device Not Connected',
                message: `Device is not connected. Current status: ${actualStatus || 'disconnected'}. Please reconnect the device.`
            });
        }

        if (!hasClient || actualStatus !== 'connected') {
            return res.status(400).json({
                error: 'Device Not Connected',
                message: `Device must be connected to send messages. Current status: ${actualStatus || 'disconnected'}`
            });
        }

        // Send message through WhatsApp Manager
        const result = await whatsappManager.sendMessage(
            deviceId,  // Use converted number, not req.params.id string
            recipient,
            message
        );

        // Log message to database
        try {
            await query(
                `INSERT INTO messages (user_id, device_id, recipient_phone, message_type, content, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [req.user.userId, deviceId, recipient, 'text', message, 'sent']
            );
        } catch (dbError) {
            console.error('Error logging message to database:', dbError);
            // Don't fail the request if logging fails
        }

        res.json({
            message: 'Message sent successfully',
            messageId: result.id?._serialized || result.id
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to send message: ' + error.message
        });
    }
});

module.exports = router;
