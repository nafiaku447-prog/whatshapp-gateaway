const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Avatar Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // user-{id}-{timestamp}.ext
        const ext = path.extname(file.originalname);
        cb(null, `user-${req.user.userId}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get all users (admin only - simplified for now)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT id, first_name, last_name, email, phone, is_verified, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );

        res.json({
            users: result.rows
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch users'
        });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.is_verified, u.created_at, u.api_key, u.profile_picture,
                    sp.name as plan_name, sp.type as plan_type, sp.price,
                    us.status as subscription_status, us.start_date, us.end_date
             FROM users u
             LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
             LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE u.id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                isVerified: user.is_verified,
                createdAt: user.created_at,
                apiKey: user.api_key,
                profilePicture: user.profile_picture,
                subscription: {
                    plan: user.plan_name,
                    type: user.plan_type,
                    price: user.price,
                    status: user.subscription_status,
                    startDate: user.start_date,
                    endDate: user.end_date
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch profile'
        });
    }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First name and last name are required' });
        }

        const result = await query(
            'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING id, first_name, last_name, email',
            [firstName, lastName, req.user.userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both current and new passwords are required' });
        }

        // Get current password hash
        const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.userId]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Regenerate API Key
router.post('/api-key/regenerate', authenticateToken, async (req, res) => {
    try {
        const newKey = 'wa_live_' + crypto.randomBytes(24).toString('hex');

        await query('UPDATE users SET api_key = $1 WHERE id = $2', [newKey, req.user.userId]);

        res.json({
            message: 'API Key regenerated successfully',
            apiKey: newKey
        });
    } catch (error) {
        console.error('Regenerate API key error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Upload Avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Construct public URL
        // req.get('host') returns 'localhost:5000' usually
        // We ensure consistent forward slashes in logic
        const protocol = req.protocol;
        const host = req.get('host');
        // If filename is encoded or strange, we might want to sanitize it but Multer does some already
        const avatarUrl = `${protocol}://${host}/uploads/avatars/${req.file.filename}`;

        console.log('Detected Host:', host);
        console.log('Generated Avatar URL:', avatarUrl);

        // Update database
        await query(
            'UPDATE users SET profile_picture = $1 WHERE id = $2',
            [avatarUrl, req.user.userId]
        );

        res.json({
            message: 'Avatar uploaded successfully',
            avatarUrl: avatarUrl
        });

    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: error.message || 'Server Error' });
    }
});

module.exports = router;
