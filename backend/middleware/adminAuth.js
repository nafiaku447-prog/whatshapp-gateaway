const jwt = require('jsonwebtoken');
const { query } = require('../db');

/**
 * Middleware to check if user is authenticated and has admin role
 */
async function requireAdmin(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const result = await query(
            'SELECT id, email, is_admin, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User does not exist'
            });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Account Inactive',
                message: 'Your account has been deactivated'
            });
        }

        // Check if user is admin
        if (!user.is_admin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'The provided token is invalid'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token Expired',
                message: 'Your session has expired. Please log in again.'
            });
        }

        console.error('Admin auth error:', error);
        return res.status(500).json({
            error: 'Server Error',
            message: 'Failed to authenticate'
        });
    }
}

module.exports = { requireAdmin };
