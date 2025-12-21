const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token
 */
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        return {
            googleId: payload['sub'],
            email: payload['email'],
            firstName: payload['given_name'] || '',
            lastName: payload['family_name'] || '',
            profilePicture: payload['picture'] || null,
            emailVerified: payload['email_verified']
        };
    } catch (error) {
        console.error('Google token verification failed:', error);
        throw new Error('Invalid Google token');
    }
}

/**
 * Handle Google OAuth Login/Register
 */
async function googleAuth(req, res) {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Verify Google token
        const googleUser = await verifyGoogleToken(credential);

        // Check if user exists
        let userResult = await query(
            'SELECT * FROM users WHERE email = $1',
            [googleUser.email]
        );

        let user;
        let isNewUser = false;

        if (userResult.rows.length === 0) {
            // Create new user
            isNewUser = true;

            // Generate random password for Google users
            const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

            const insertResult = await query(
                `INSERT INTO users (
                    first_name, 
                    last_name, 
                    email, 
                    phone,
                    password_hash, 
                    google_id,
                    profile_picture,
                    is_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id, first_name, last_name, email, phone, is_verified, created_at`,
                [
                    googleUser.firstName,
                    googleUser.lastName,
                    googleUser.email,
                    '', // No phone for Google login
                    randomPassword,
                    googleUser.googleId,
                    googleUser.profilePicture,
                    googleUser.emailVerified
                ]
            );

            user = insertResult.rows[0];

            // Assign free subscription plan
            const planResult = await query(
                `SELECT id FROM subscription_plans WHERE name = 'Free' LIMIT 1`
            );

            if (planResult.rows.length > 0) {
                await query(
                    `INSERT INTO user_subscriptions (user_id, plan_id, status) 
                     VALUES ($1, $2, 'active')`,
                    [user.id, planResult.rows[0].id]
                );
            }
        } else {
            // User exists
            user = userResult.rows[0];

            // Update Google ID if not set
            if (!user.google_id) {
                await query(
                    'UPDATE users SET google_id = $1, profile_picture = $2 WHERE id = $3',
                    [googleUser.googleId, googleUser.profilePicture, user.id]
                );
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: isNewUser ? 'Account created successfully' : 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                isVerified: user.is_verified,
                profilePicture: googleUser.profilePicture
            },
            isNewUser
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Google authentication failed'
        });
    }
}

module.exports = {
    googleAuth
};
