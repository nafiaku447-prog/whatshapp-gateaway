const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { googleAuth } = require('../middleware/googleAuth');
const { generateOTP, sendVerificationEmail } = require('../utils/emailService');

// Temporary OTP storage (in production, use Redis or database)
const otpStore = new Map();

// OTP Expiry time (10 minutes)
const OTP_EXPIRY = 10 * 60 * 1000;


// ============================================
// REGISTER
// ============================================
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, phone, password } = req.body;

        // Check if user already exists
        const userCheck = await query(
            'SELECT * FROM users WHERE email = $1 OR phone = $2',
            [email, phone]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'Email or phone number is already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const result = await query(
            `INSERT INTO users (first_name, last_name, email, phone, password_hash) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, first_name, last_name, email, phone, created_at`,
            [firstName, lastName, email, phone, passwordHash]
        );

        const user = result.rows[0];

        // Assign free plan to new user
        await query(
            `INSERT INTO user_subscriptions (user_id, plan_id, status, start_date)
             VALUES ($1, (SELECT id FROM subscription_plans WHERE name = 'Free' LIMIT 1), 'active', NOW())`,
            [user.id]
        );

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to register user'
        });
    }
});


// ============================================
// LOGIN WITH EMAIL VERIFICATION
// ============================================
router.post('/login-verify', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const result = await query(
            'SELECT id, first_name, last_name, email, phone, is_verified, is_active, password_hash, profile_picture FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Email atau password salah'
            });
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Account Inactive',
                message: 'Akun Anda telah dinonaktifkan'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Email atau password salah'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + OTP_EXPIRY;

        // Store OTP with user email
        otpStore.set(email, {
            otp,
            expiry: otpExpiry,
            userId: user.id
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, otp, user.first_name);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return res.status(500).json({
                error: 'Email Error',
                message: 'Gagal mengirim email verifikasi. Silakan coba lagi.'
            });
        }

        res.json({
            message: 'Kode verifikasi telah dikirim ke email Anda',
            email: email
        });
    } catch (error) {
        console.error('Login-verify error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Gagal memproses login'
        });
    }
});

// ============================================
// VERIFY OTP
// ============================================
router.post('/verify-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Valid verification code is required')
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, code } = req.body;

        // Check if OTP exists for this email
        const storedOTP = otpStore.get(email);

        if (!storedOTP) {
            return res.status(400).json({
                error: 'Invalid OTP',
                message: 'Kode verifikasi tidak valid atau sudah kadaluarsa'
            });
        }

        // Check if OTP is expired
        if (Date.now() > storedOTP.expiry) {
            otpStore.delete(email);
            return res.status(400).json({
                error: 'OTP Expired',
                message: 'Kode verifikasi sudah kadaluarsa. Silakan kirim ulang kode.'
            });
        }

        // Verify OTP
        if (storedOTP.otp !== code) {
            return res.status(400).json({
                error: 'Invalid OTP',
                message: 'Kode verifikasi salah'
            });
        }

        // OTP is valid, remove from store
        otpStore.delete(email);

        // Get user data
        const result = await query(
            'SELECT id, first_name, last_name, email, phone, is_verified, profile_picture FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Pengguna tidak ditemukan'
            });
        }

        const user = result.rows[0];

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Verifikasi berhasil',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                isVerified: user.is_verified,
                profilePicture: user.profile_picture
            },
            token
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Gagal memverifikasi kode'
        });
    }
});

// ============================================
// RESEND OTP
// ============================================
router.post('/resend-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Check if user exists
        const result = await query(
            'SELECT id, first_name FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Pengguna tidak ditemukan'
            });
        }

        const user = result.rows[0];

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + OTP_EXPIRY;

        // Update OTP in store
        otpStore.set(email, {
            otp,
            expiry: otpExpiry,
            userId: user.id
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, otp, user.first_name);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return res.status(500).json({
                error: 'Email Error',
                message: 'Gagal mengirim email verifikasi. Silakan coba lagi.'
            });
        }

        res.json({
            message: 'Kode verifikasi baru telah dikirim ke email Anda'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Gagal mengirim ulang kode'
        });
    }
});

// ============================================
// LOGIN (Legacy - without verification)
// ============================================
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const result = await query(
            'SELECT id, first_name, last_name, email, phone, is_verified, is_active, password_hash, profile_picture FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Email or password is incorrect'
            });
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                error: 'Account Inactive',
                message: 'Your account has been deactivated'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                isVerified: user.is_verified,
                profilePicture: user.profile_picture
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to login'
        });
    }
});

// ============================================
// GET CURRENT USER
// ============================================
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.is_verified, u.created_at,
                    sp.name as plan_name, sp.type as plan_type, 
                    us.status as subscription_status, us.end_date
             FROM users u
             LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
             LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE u.id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
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
                subscription: {
                    plan: user.plan_name,
                    type: user.plan_type,
                    status: user.subscription_status,
                    endDate: user.end_date
                }
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch user data'
        });
    }
});

// ============================================
// REFRESH TOKEN
// ============================================
router.post('/refresh', authenticateToken, (req, res) => {
    try {
        // Create new token
        const token = jwt.sign(
            { userId: req.user.userId, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Token refreshed successfully',
            token
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to refresh token'
        });
    }
});

// ============================================
// GOOGLE OAUTH LOGIN
// ============================================
router.post('/google', googleAuth);

module.exports = router;
