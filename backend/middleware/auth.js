const jwt = require('jsonwebtoken');
const { query } = require('../db');

// ============================================
// TRIPLE AUTHENTICATION MIDDLEWARE
// Supports: User API Key, Device Token, and JWT Token
// ============================================

/**
 * Authenticate using API Key (User or Device) or JWT Token
 * Priority: Device Token > User API Key > JWT Token
 */
const authenticate = async (req, res, next) => {
    // 1. Check for API Key (could be User API Key or Device Token)
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        try {
            // First, check if it's a DEVICE TOKEN
            const deviceResult = await query(
                `SELECT d.id, d.device_name, d.user_id, d.status,
                        u.email, u.first_name, u.last_name
                 FROM devices d
                 JOIN users u ON d.user_id = u.id
                 WHERE d.api_token = $1 AND d.is_active = true AND u.is_active = true`,
                [apiKey]
            );

            if (deviceResult.rows.length > 0) {
                // It's a DEVICE TOKEN!
                const device = deviceResult.rows[0];

                req.user = {
                    userId: device.user_id,
                    email: device.email,
                    firstName: device.first_name,
                    lastName: device.last_name,
                    authMethod: 'device_token'
                };

                // IMPORTANT: Store device info for auto-selection
                req.deviceId = device.id;
                req.deviceName = device.device_name;

                console.log(`✅ Authenticated via Device Token: Device ${device.id} (${device.device_name})`);
                return next();
            }

            // If not device token, check if it's a USER API KEY
            const userResult = await query(
                'SELECT id, first_name, last_name, email FROM users WHERE api_key = $1 AND is_active = true',
                [apiKey]
            );

            if (userResult.rows.length === 0) {
                return res.status(403).json({
                    error: 'Invalid API Key',
                    message: 'The provided API Key is invalid or has been revoked'
                });
            }

            // It's a USER API KEY
            req.user = {
                userId: userResult.rows[0].id,
                email: userResult.rows[0].email,
                firstName: userResult.rows[0].first_name,
                lastName: userResult.rows[0].last_name,
                authMethod: 'user_api_key'
            };

            return next();

        } catch (error) {
            console.error('API Key verification error:', error);
            return res.status(500).json({
                error: 'Authentication Error',
                message: 'Failed to verify API Key'
            });
        }
    }

    // 2. Check for JWT Token (Authorization: Bearer header)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access Denied',
            message: 'No authentication provided. Use X-API-Key header (User API Key or Device Token) or Authorization Bearer token'
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            ...verified,
            authMethod: 'jwt'
        };
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Invalid Token',
            message: 'JWT Token is invalid or expired'
        });
    }
};

/**
 * Legacy JWT-only authentication (for backward compatibility)
 * @deprecated Use authenticate() instead
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access Denied',
            message: 'No token provided'
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Invalid Token',
            message: 'Token is invalid or expired'
        });
    }
};

/**
 * Optional Authentication (doesn't require token but attaches user if present)
 */
const optionalAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        try {
            // Check device token first
            const deviceResult = await query(
                `SELECT d.id, d.user_id, u.email FROM devices d
                 JOIN users u ON d.user_id = u.id
                 WHERE d.api_token = $1 AND d.is_active = true AND u.is_active = true`,
                [apiKey]
            );

            if (deviceResult.rows.length > 0) {
                req.user = {
                    userId: deviceResult.rows[0].user_id,
                    email: deviceResult.rows[0].email,
                    authMethod: 'device_token'
                };
                req.deviceId = deviceResult.rows[0].id;
                return next();
            }

            // Check user API key
            const userResult = await query(
                'SELECT id, email FROM users WHERE api_key = $1 AND is_active = true',
                [apiKey]
            );

            if (userResult.rows.length > 0) {
                req.user = {
                    userId: userResult.rows[0].id,
                    email: userResult.rows[0].email,
                    authMethod: 'user_api_key'
                };
            }
        } catch (error) {
            // Ignore error, continue as guest
        }
    } else {
        // Try JWT Token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const verified = jwt.verify(token, process.env.JWT_SECRET);
                req.user = {
                    ...verified,
                    authMethod: 'jwt'
                };
            } catch (error) {
                // Token is invalid but we don't block the request
            }
        }
    }

    next();
};

module.exports = {
    authenticate,        // NEW: Supports User API Key, Device Token, and JWT
    authenticateToken,   // LEGACY: JWT only
    optionalAuth
};
