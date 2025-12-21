const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { query } = require('../db');

/**
 * WhatsApp Manager Service
 * Manages multiple WhatsApp Web clients for different devices
 */
class WhatsAppManager {
    constructor() {
        // Map to store active clients: deviceId -> Client instance
        this.clients = new Map();

        // Map to store QR codes: deviceId -> QR code string
        this.qrCodes = new Map();

        // Map to store connection status: deviceId -> status
        this.connectionStatus = new Map();

        // Map to track QR retries: deviceId -> count
        this.qrRetries = new Map();

        // Map to track connection timestamps: deviceId -> timestamp
        this.connectionTimestamps = new Map();

        // Session storage directory
        this.sessionPath = path.join(__dirname, '..', '.wwebjs_auth');

        // Ensure session directory exists
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }

        console.log('✅ WhatsApp Manager initialized');
    }

    /**
     * Initialize a WhatsApp client for a device
     */
    async initializeClient(deviceId, deviceName, phoneNumber) {
        try {
            console.log(`📱 Initializing WhatsApp client for device ${deviceId} (${deviceName})`);

            // Check if client already exists
            if (this.clients.has(deviceId)) {
                console.log(`⚠️  Client already exists for device ${deviceId}`);
                return this.clients.get(deviceId);
            }

            // Create new client with LocalAuth
            const client = new Client({
                authStrategy: new LocalAuth({
                    clientId: `device-${deviceId}`,
                    dataPath: this.sessionPath
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            });

            // Setup event handlers
            this.setupClientEvents(client, deviceId, deviceName);

            // Store client
            this.clients.set(deviceId, client);
            this.connectionStatus.set(deviceId, 'initializing');

            // Initialize the client
            await client.initialize();

            return client;

        } catch (error) {
            console.error(`❌ Error initializing client for device ${deviceId}:`, error);
            this.connectionStatus.set(deviceId, 'error');
            throw error;
        }
    }

    /**
     * Setup event handlers for a WhatsApp client
     */
    setupClientEvents(client, deviceId, deviceName) {
        // Initialize retry count
        this.qrRetries.set(deviceId, 0);

        // QR Code event - when QR code is ready to be scanned
        client.on('qr', async (qr) => {
            // CRITICAL: Ignore QR if already connected/authenticated to prevent loop
            const currentStatus = this.connectionStatus.get(deviceId);
            if (currentStatus === 'connected' || currentStatus === 'authenticated') {
                console.log(`🚫 Ignoring QR code for device ${deviceId} because status is already '${currentStatus}'`);
                return;
            }

            // SELF-CHECK: Apakah device ini masih ada di database?
            const deviceCheck = await query('SELECT id FROM devices WHERE id = $1', [deviceId]);
            if (deviceCheck.rows.length === 0) {
                console.log(`💀 ZOMBIE DETECTED: Device ${deviceId} no longer exists in DB. Killing client...`);
                await this.disconnectDevice(deviceId);
                return;
            }

            const retries = this.qrRetries.get(deviceId) || 0;
            const MAX_RETRIES = 5 // DINAIAKKAN JADI 15x (± 8 Menit durasi hidup)

            console.log(`🔄 Refreshing QR Code for device ${deviceId} (Security Rotation ${retries + 1}/${MAX_RETRIES})`);

            // Check if max retries reached
            if (retries >= MAX_RETRIES) {
                console.log(`🛑 Max QR retries reached for device ${deviceId}. Stopping client.`);
                await this.disconnectDevice(deviceId); // Stop client

                // Update DB explicitly to disconnected to clear UI
                await query(
                    `UPDATE devices 
                    SET status = 'disconnected', qr_code = NULL, updated_at = NOW()
                    WHERE id = $1`,
                    [deviceId]
                );
                return;
            }

            // Increment retry count
            this.qrRetries.set(deviceId, retries + 1);

            // Store QR code
            this.qrCodes.set(deviceId, qr);

            // Update database with scanning status
            try {
                // Convert QR to data URL (Base64 image)
                const qrDataURL = await this.generateQRDataURL(qr);

                await query(
                    `UPDATE devices 
                     SET status = 'scanning', qr_code = $1, updated_at = NOW()
                     WHERE id = $2`,
                    [qrDataURL, deviceId]
                );

                this.connectionStatus.set(deviceId, 'scanning');
                console.log(`✅ QR code saved for device ${deviceId}`);

                // Also display in terminal for debugging
                console.log(`\n📱 Device ${deviceId} (${deviceName}) - Scan this QR code:\n`);
                qrcode.generate(qr, { small: true });

            } catch (error) {
                console.error(`❌ Error saving QR code for device ${deviceId}:`, error);
            }
        });

        // Ready event - when client is authenticated and ready
        client.on('ready', async () => {
            console.log(`✅ WhatsApp client ready for device ${deviceId} (${deviceName})`);

            try {
                // Get client info
                const info = client.info;

                // Update database with connected status
                await query(
                    `UPDATE devices 
                     SET status = 'connected', 
                         is_active = true, 
                         qr_code = NULL,
                         last_seen = NOW(),
                         updated_at = NOW()
                     WHERE id = $1`,
                    [deviceId]
                );

                this.connectionStatus.set(deviceId, 'connected');
                this.qrCodes.delete(deviceId); // Clear QR code
                this.qrRetries.delete(deviceId); // Clear retries

                // Record connection timestamp to prevent false disconnections
                this.connectionTimestamps.set(deviceId, Date.now());

                console.log(`✅ Device ${deviceId} connected as:`, info.wid.user);

            } catch (error) {
                console.error(`❌ Error updating device status for ${deviceId}:`, error);
            }
        });

        // Authenticated event
        client.on('authenticated', () => {
            console.log(`🔐 Device ${deviceId} authenticated`);
            this.connectionStatus.set(deviceId, 'authenticated');
        });

        // Authentication failure event
        client.on('auth_failure', async (msg) => {
            console.error(`❌ Authentication failed for device ${deviceId}:`, msg);

            try {
                await query(
                    `UPDATE devices 
                     SET status = 'disconnected', 
                         is_active = false,
                         qr_code = NULL,
                         updated_at = NOW()
                     WHERE id = $1`,
                    [deviceId]
                );

                this.connectionStatus.set(deviceId, 'auth_failed');

            } catch (error) {
                console.error(`❌ Error updating device status:`, error);
            }
        });

        // Disconnected event
        client.on('disconnected', async (reason) => {
            console.log(`⚠️  Device ${deviceId} disconnected. Reason:`, reason);

            // Check if this is a spurious disconnection
            const connectedAt = this.connectionTimestamps.get(deviceId);
            const now = Date.now();
            const timeSinceConnection = connectedAt ? (now - connectedAt) / 1000 : Infinity;

            // IGNORE disconnections within 10 seconds of connection (likely spurious)
            if (timeSinceConnection < 10) {
                console.log(`🚫 Ignoring spurious disconnection for device ${deviceId} (${timeSinceConnection.toFixed(1)}s after connection)`);
                return; // Don't process this disconnect
            }

            try {
                await query(
                    `UPDATE devices 
                     SET status = 'disconnected', 
                         is_active = false,
                         qr_code = NULL,
                         updated_at = NOW()
                     WHERE id = $1`,
                    [deviceId]
                );

                this.connectionStatus.set(deviceId, 'disconnected');
                this.clients.delete(deviceId);
                this.qrCodes.delete(deviceId);
                this.qrRetries.delete(deviceId);
                this.connectionTimestamps.delete(deviceId);

                // CLEANUP: Hapus folder session dengan delay dan retry yang lebih robust
                setTimeout(async () => {
                    const fs = require('fs/promises');
                    const sessionDir = path.join(this.sessionPath, `session-device-${deviceId}`);

                    // Check if session directory exists first
                    try {
                        await fs.access(sessionDir);
                    } catch (err) {
                        if (err.code === 'ENOENT') {
                            console.log(`ℹ️  Session directory not found for device ${deviceId}, nothing to clean`);
                            return;
                        }
                    }

                    let attempts = 0;
                    const maxAttempts = 5; // Increase retry attempts
                    const retryDelay = 3000; // 3 seconds between retries

                    while (attempts < maxAttempts) {
                        try {
                            // Try to remove the session directory
                            await fs.rm(sessionDir, { recursive: true, force: true, maxRetries: 3 });
                            console.log(`🧹 Session files cleaned up for device ${deviceId} (attempt ${attempts + 1}/${maxAttempts})`);
                            break;
                        } catch (err) {
                            attempts++;

                            // If directory doesn't exist, we're done
                            if (err.code === 'ENOENT') {
                                console.log(`ℹ️  Session directory already removed for device ${deviceId}`);
                                break;
                            }

                            // Handle EBUSY (file locked) errors
                            if (err.code === 'EBUSY' || err.code === 'EPERM') {
                                if (attempts < maxAttempts) {
                                    console.log(`⏳ File locked, retrying cleanup for device ${deviceId} in ${retryDelay / 1000}s... (${attempts}/${maxAttempts})`);
                                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                                } else {
                                    console.log(`⚠️  Session cleanup failed for device ${deviceId} after ${maxAttempts} attempts (files still in use)`);
                                    console.log(`💡 Tip: Session files will be cleaned up on next server restart or when files are unlocked`);
                                }
                            } else {
                                // Other errors - log but don't fail
                                console.error(`⚠️  Unexpected cleanup error for device ${deviceId}:`, err.message);
                                if (attempts >= maxAttempts) {
                                    console.error(`❌ Cleanup failed after ${maxAttempts} attempts, skipping...`);
                                }
                            }
                        }
                    }
                }, 10000); // Wait 10 seconds before starting cleanup to ensure browser process is fully terminated

            } catch (error) {
                console.error(`❌ Error updating device status:`, error);
            }
        });

        // Message event - when a message is received
        client.on('message', async (message) => {
            console.log(`📩 Message received on device ${deviceId}:`, message.from);

            // Here you can add message handling logic
            // For example: save to database, trigger webhooks, auto-reply, etc.
        });

        // Message create event - when a message is sent or received
        client.on('message_create', async (message) => {
            // This can be used to track all messages including sent ones
        });
    }

    /**
     * Convert QR code string to Data URL (Base64 image)
     */
    async generateQRDataURL(qrString) {
        return new Promise((resolve, reject) => {
            const QRCode = require('qrcode');

            QRCode.toDataURL(qrString, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.95,
                margin: 1,
                width: 300
            }, (err, url) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            });
        });
    }

    /**
     * Get client for a device
     */
    getClient(deviceId) {
        return this.clients.get(deviceId);
    }

    /**
     * Get QR code for a device
     */
    getQRCode(deviceId) {
        return this.qrCodes.get(deviceId);
    }

    /**
     * Get connection status for a device
     */
    getConnectionStatus(deviceId) {
        const client = this.clients.get(deviceId);
        const storedStatus = this.connectionStatus.get(deviceId);

        // If no client exists, definitely disconnected
        if (!client) {
            return storedStatus || 'disconnected';
        }

        // If client exists, check if it has a pupeteer page (means it's initialized)
        try {
            // Check if pupeteer page exists and is not closed
            if (client.pupPage && !client.pupPage.isClosed()) {
                // If we have a stored status of 'connected', trust it
                if (storedStatus === 'connected') {
                    return 'connected';
                }

                // For other stored statuses, try to get actual info
                try {
                    const info = client.info;
                    if (info && info.wid) {
                        this.connectionStatus.set(deviceId, 'connected');
                        return 'connected';
                    }
                } catch (infoError) {
                    // If we can't get info but page exists and stored status is connected, trust it
                    if (storedStatus === 'connected') {
                        return 'connected';
                    }
                }
            }
        } catch (error) {
            // If error checking page, fall back to stored status
            if (storedStatus === 'connected') {
                return 'connected';
            }
        }

        // Return stored status or default to 'disconnected'
        return storedStatus || 'disconnected';
    }

    /**
     * Disconnect a device
     */
    async disconnectDevice(deviceId) {
        try {
            const client = this.clients.get(deviceId);

            if (client) {
                console.log(`🔌 Disconnecting device ${deviceId}...`);

                // Destroy client and wait for browser to fully close
                await client.destroy();

                // Give browser process time to fully terminate
                await new Promise(resolve => setTimeout(resolve, 2000));

                this.clients.delete(deviceId);
                this.qrCodes.delete(deviceId);
                this.qrRetries.delete(deviceId);
                this.connectionStatus.delete(deviceId);

                // Update database
                await query(
                    `UPDATE devices 
                     SET status = 'disconnected', 
                         is_active = false,
                         qr_code = NULL,
                         updated_at = NOW()
                     WHERE id = $1`,
                    [deviceId]
                );

                console.log(`✅ Device ${deviceId} disconnected successfully`);

                // Optional: Clean up session files after manual disconnect
                // Wait longer to ensure all file handles are released
                setTimeout(async () => {
                    const fs = require('fs/promises');
                    const sessionDir = path.join(this.sessionPath, `session-device-${deviceId}`);

                    try {
                        await fs.access(sessionDir);
                        console.log(`🗑️  Cleaning up session files for manually disconnected device ${deviceId}...`);

                        // Try cleanup with retries
                        let attempts = 0;
                        const maxAttempts = 3;

                        while (attempts < maxAttempts) {
                            try {
                                await fs.rm(sessionDir, { recursive: true, force: true, maxRetries: 3 });
                                console.log(`🧹 Session cleanup successful for device ${deviceId}`);
                                break;
                            } catch (err) {
                                attempts++;
                                if (err.code === 'ENOENT') break;
                                if ((err.code === 'EBUSY' || err.code === 'EPERM') && attempts < maxAttempts) {
                                    console.log(`⏳ Retrying cleanup for device ${deviceId}... (${attempts}/${maxAttempts})`);
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                } else if (attempts >= maxAttempts) {
                                    console.log(`ℹ️  Session cleanup will be retried later for device ${deviceId}`);
                                }
                            }
                        }
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.log(`ℹ️  Session cleanup skipped for device ${deviceId}:`, err.message);
                        }
                    }
                }, 8000); // Wait 8 seconds before cleanup
            } else {
                console.log(`⚠️  No active client found for device ${deviceId}`);

                // Still update database status
                await query(
                    `UPDATE devices 
                     SET status = 'disconnected', 
                         is_active = false,
                         qr_code = NULL,
                         updated_at = NOW()
                     WHERE id = $1`,
                    [deviceId]
                );
            }

            // NOTE: Session folder cleanup is optional on disconnect
            // If you want to preserve session for quick reconnect, comment out the cleanup code above

        } catch (error) {
            console.error(`❌ Error disconnecting device ${deviceId}:`, error);
            throw error;
        }
    }

    /**
     * Send a text message
     */
    async sendMessage(deviceId, recipient, message) {
        try {
            const client = this.getClient(deviceId);

            if (!client) {
                throw new Error('Device not connected');
            }

            // Ensure recipient is in correct format (e.g., 628123456789@c.us)
            let chatId = recipient;
            if (!chatId.includes('@')) {
                chatId = `${recipient}@c.us`;
            }

            const result = await client.sendMessage(chatId, message);
            console.log(`✅ Message sent from device ${deviceId} to ${recipient}`);

            return result;

        } catch (error) {
            console.error(`❌ Error sending message from device ${deviceId}:`, error);
            throw error;
        }
    }

    /**
     * Get device info
     */
    async getDeviceInfo(deviceId) {
        try {
            const client = this.getClient(deviceId);

            if (!client) {
                return null;
            }

            const info = client.info;
            const state = await client.getState();

            // Get battery info if available
            let batteryInfo = null;
            try {
                if (info && info.battery !== undefined) {
                    batteryInfo = info.battery;
                }
            } catch (e) {
                // Battery info not available
            }

            return {
                ...info,
                state,
                battery: batteryInfo,
                connectionStatus: this.getConnectionStatus(deviceId)
            };

        } catch (error) {
            console.error(`❌ Error getting device info for ${deviceId}:`, error);
            return null;
        }
    }

    /**
     * Load all active devices from database on startup
     */
    async loadActiveDevices() {
        try {
            console.log('🔄 Loading active devices from database...');

            const result = await query(
                `SELECT id, device_name, phone_number 
                 FROM devices 
                 WHERE is_active = true AND status = 'connected'`
            );

            for (const device of result.rows) {
                console.log(`🔄 Reconnecting device ${device.id} (${device.device_name})`);
                try {
                    await this.initializeClient(device.id, device.device_name, device.phone_number);
                } catch (error) {
                    console.error(`❌ Failed to reconnect device ${device.id}:`, error);
                }
            }

            console.log(`✅ Loaded ${result.rows.length} active devices`);

        } catch (error) {
            console.error('❌ Error loading active devices:', error);
        }
    }
}

// Create singleton instance
const whatsappManager = new WhatsAppManager();

module.exports = whatsappManager;
