const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service is ready');
    }
});

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email with OTP
 */
async function sendVerificationEmail(email, otp, userName = 'User') {
    const mailOptions = {
        from: `"${process.env.APP_NAME || 'WA Gateway'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Kode Verifikasi Login - WA Gateway',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 0;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 40px 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .header p {
                        margin: 10px 0 0;
                        opacity: 0.9;
                        font-size: 14px;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        color: #1a202c;
                        margin-bottom: 20px;
                    }
                    .message {
                        color: #4a5568;
                        margin-bottom: 30px;
                        font-size: 15px;
                    }
                    .otp-box {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px;
                        margin: 30px 0;
                    }
                    .otp-code {
                        font-size: 42px;
                        font-weight: 800;
                        letter-spacing: 8px;
                        color: white;
                        margin: 0;
                        font-family: 'Courier New', monospace;
                    }
                    .otp-label {
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-top: 10px;
                    }
                    .warning {
                        background: #fff5f5;
                        border-left: 4px solid #f56565;
                        padding: 15px 20px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .warning p {
                        margin: 0;
                        color: #742a2a;
                        font-size: 14px;
                    }
                    .info {
                        background: #ebf8ff;
                        border-left: 4px solid #4299e1;
                        padding: 15px 20px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .info p {
                        margin: 0;
                        color: #2c5282;
                        font-size: 14px;
                    }
                    .footer {
                        background: #f7fafc;
                        padding: 30px;
                        text-align: center;
                        color: #718096;
                        font-size: 13px;
                        border-top: 1px solid #e2e8f0;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                    .footer a {
                        color: #667eea;
                        text-decoration: none;
                    }
                    .icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="icon">🔐</div>
                        <h1>WA Gateway</h1>
                        <p>Verifikasi Login Anda</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Halo, ${userName}! 👋
                        </div>
                        
                        <div class="message">
                            Kami menerima permintaan untuk login ke akun WA Gateway Anda. Gunakan kode verifikasi di bawah ini untuk melanjutkan:
                        </div>
                        
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                            <div class="otp-label">Kode Verifikasi</div>
                        </div>
                        
                        <div class="info">
                            <p>⏰ Kode ini akan kadaluarsa dalam <strong>10 menit</strong></p>
                        </div>
                        
                        <div class="warning">
                            <p>⚠️ <strong>Penting:</strong> Jangan bagikan kode ini kepada siapa pun, termasuk tim support kami. Kami tidak akan pernah meminta kode verifikasi Anda.</p>
                        </div>
                        
                        <div class="message" style="margin-top: 30px;">
                            Jika Anda tidak mencoba login, abaikan email ini atau hubungi support kami jika Anda khawatir tentang keamanan akun Anda.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>WA Gateway</strong></p>
                        <p>Email otomatis, mohon tidak membalas email ini.</p>
                        <p style="margin-top: 15px;">
                            &copy; ${new Date().getFullYear()} WA Gateway. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}

module.exports = {
    generateOTP,
    sendVerificationEmail
};
