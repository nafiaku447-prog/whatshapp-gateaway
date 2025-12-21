const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const whatsappManager = require('../services/whatsappManager');

/**
 * SIMPLE SEND ENDPOINT - Mirip Fonnte
 * POST /api/send
 * 
 * Automatically uses the first connected device
 * No need to specify device ID!
 */
router.post('/send', authenticate, async (req, res) => {
    try {
        const { recipient, message, target } = req.body;

        // Support both 'recipient' and 'target' (Fonnte compatibility)
        const phoneNumber = recipient || target;

        if (!phoneNumber || !message) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Recipient/target and message are required'
            });
        }

        let deviceId, deviceName;

        // Check if device is already specified from Device Token
        if (req.deviceId) {
            // User authenticated with DEVICE TOKEN - use that device
            deviceId = req.deviceId;
            deviceName = req.deviceName;
            console.log(`📱 Using device from token: ${deviceId} (${deviceName})`);
        } else {
            // User authenticated with USER API KEY - auto-select first connected device
            const deviceResult = await query(
                `SELECT id, device_name, status FROM devices 
                 WHERE user_id = $1 AND status = 'connected' 
                 ORDER BY last_seen DESC 
                 LIMIT 1`,
                [req.user.userId]
            );

            if (deviceResult.rows.length === 0) {
                return res.status(400).json({
                    error: 'No Connected Device',
                    message: 'You do not have any connected WhatsApp devices. Please connect a device first.'
                });
            }

            const device = deviceResult.rows[0];
            deviceId = parseInt(device.id, 10);
            deviceName = device.device_name;
            console.log(`📱 Auto-selected device: ${deviceId} (${deviceName})`);
        }

        // Check if device is actually connected in WhatsApp Manager
        const actualStatus = whatsappManager.getConnectionStatus(deviceId);
        const hasClient = whatsappManager.getClient(deviceId);

        if (!hasClient || actualStatus !== 'connected') {
            // Update database status
            await query(
                `UPDATE devices SET status = $1, is_active = false WHERE id = $2`,
                [actualStatus || 'disconnected', deviceId]
            );

            return res.status(400).json({
                error: 'Device Not Connected',
                message: `Device "${deviceName}" is not connected. Please reconnect your device.`
            });
        }

        // Send message through WhatsApp Manager
        const result = await whatsappManager.sendMessage(
            deviceId,
            phoneNumber,
            message
        );

        // Log message to database
        try {
            await query(
                `INSERT INTO messages (user_id, device_id, recipient_phone, message_type, content, status, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [req.user.userId, deviceId, phoneNumber, 'text', message, 'sent']
            );
        } catch (dbError) {
            console.error('Error logging message to database:', dbError);
            // Don't fail the request if logging fails
        }

        res.json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: result.id?._serialized || result.id,
                device: {
                    id: deviceId,
                    name: deviceName
                },
                recipient: phoneNumber,
                status: 'sent'
            }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to send message: ' + error.message
        });
    }
});

/**
 * GET DEVICE STATUS - Simple endpoint
 * GET /api/send/status
 */
router.get('/send/status', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, device_name, status, phone_number 
             FROM devices 
             WHERE user_id = $1 AND status = 'connected'
             ORDER BY last_seen DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            connectedDevices: result.rows.length,
            devices: result.rows
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to get device status'
        });
    }
});

module.exports = router;
