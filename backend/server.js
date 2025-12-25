const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================

// Security - Custom CSP to allow frontend to work
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for now to allow inline scripts
}));

// CORS - Allow all origins for development
app.use(cors());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: 1000, // Increased from default to prevent 429 during dev
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files needed for uploads with explicit CORS headers
app.use('/uploads', cors(), (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Serve static files (HTML, CSS, JS) from root
app.use(express.static(path.join(__dirname, '..')));

// ============================================
// Routes
// ============================================

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deviceRoutes = require('./routes/devices');
const contactRoutes = require('./routes/contacts');
const messageRoutes = require('./routes/messages');
const webhookRoutes = require('./routes/webhooks');
const statsRoutes = require('./routes/statistics');
const sendRoutes = require('./routes/send');  // Simple send endpoint (Fonnte-like)
const systemStatsRoutes = require('./routes/systemStats');  // System monitoring

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auto-replies', require('./routes/autoReply'));
app.use('/api/system', systemStatsRoutes);  // System monitoring endpoint
app.use('/api', sendRoutes);  // Simple /api/send endpoint

// ============================================
// Error Handling
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Start Server
// ============================================

const server = app.listen(PORT, async () => {
    const env = process.env.NODE_ENV || 'development';
    const baseUrl = `http://localhost:${PORT}`;
    const apiUrl = `${baseUrl}/api`;

    // Color codes
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        green: '\x1b[32m',
        cyan: '\x1b[36m',
        yellow: '\x1b[33m',
        magenta: '\x1b[35m',
        blue: '\x1b[34m',
        red: '\x1b[31m',
        white: '\x1b[37m',
        gray: '\x1b[90m'
    };

    // Clear console and show banner
    console.clear();
    console.log('\n');

    // ASCII Art Banner
    console.log(`${colors.cyan}╔══════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}██╗    ██╗ █████╗      ██████╗  █████╗ ████████╗███████╗██╗    ██╗ █████╗ ██╗   ██╗${colors.reset}  ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}██║    ██║██╔══██╗    ██╔════╝ ██╔══██╗╚══██╔══╝██╔════╝██║    ██║██╔══██╗╚██╗ ██╔╝${colors.reset}  ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}██║ █╗ ██║███████║    ██║  ███╗███████║   ██║   █████╗  ██║ █╗ ██║███████║ ╚████╔╝ ${colors.reset}  ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}██║███╗██║██╔══██║    ██║   ██║██╔══██║   ██║   ██╔══╝  ██║███╗██║██╔══██║  ╚██╔╝  ${colors.reset}  ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}╚███╔███╔╝██║  ██║    ╚██████╔╝██║  ██║   ██║   ███████╗╚███╔███╔╝██║  ██║   ██║   ${colors.reset}  ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta} ╚══╝╚══╝ ╚═╝  ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ${colors.reset}  ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                          ${colors.bright}${colors.yellow}G A T E W A Y   A P I   S E R V E R${colors.reset}                         ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════════════ ╣${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);

    // Server Info Box
    const serverInfo = [
        `  ${colors.bright}${colors.green}◉${colors.reset} ${colors.white}Status${colors.reset}        ${colors.green}▶ ${colors.bright}RUNNING${colors.reset}${colors.green} ◀${colors.reset}`,
        `  ${colors.bright}${colors.cyan}◉${colors.reset} ${colors.white}Port${colors.reset}          ${colors.yellow}${PORT.toString().padEnd(6)}${colors.reset}`,
        `  ${colors.bright}${colors.magenta}◉${colors.reset} ${colors.white}Environment${colors.reset} ${env === 'production' ? colors.red : colors.yellow}${env.toUpperCase().padEnd(11)}${colors.reset}`,
        `  ${colors.bright}${colors.blue}◉${colors.reset} ${colors.white}Database${colors.reset}      ${colors.cyan}PostgreSQL${colors.reset}`,
        `  ${colors.bright}${colors.yellow}◉${colors.reset} ${colors.white}Uptime${colors.reset}       ${colors.gray}Just Started${colors.reset}`
    ];

    serverInfo.forEach(line => {
        console.log(`${colors.cyan}║${colors.reset}${line.padEnd(70)}${colors.cyan}║${colors.reset}`);
    });

    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════════════╣${colors.reset}`);

    // URL Box
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.white}📍 ACCESS URLS${colors.reset}                                                 ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}┌─${colors.reset} ${colors.white}Local Server${colors.reset}                                   ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}│${colors.reset} ${colors.cyan}${baseUrl}${colors.reset}               ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}└─${colors.reset} ${colors.gray}CTRL + Click to open${colors.reset}                            ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}┌─${colors.reset} ${colors.white}API Endpoint${colors.reset}                                   ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}│${colors.reset} ${colors.cyan}${apiUrl}${colors.reset}              ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}└─${colors.reset} ${colors.gray}REST API Base Path${colors.reset}                             ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════════════╣${colors.reset}`);

    // Routes Box
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.white}📡 AVAILABLE ROUTES${colors.reset}                                             ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);

    const routes = [
        { path: '/api/auth', desc: 'Authentication endpoints' },
        { path: '/api/users', desc: 'User management' },
        { path: '/api/devices', desc: 'Device management' },
        { path: '/api/contacts', desc: 'Contact management' },
        { path: '/api/messages', desc: 'Message handling' },
        { path: '/api/webhooks', desc: 'Webhook endpoints' },
        { path: '/api/stats', desc: 'Statistics & analytics' },
        { path: '/health', desc: 'Server health check' }
    ];

    routes.forEach((route, index) => {
        const bullet = index === routes.length - 1 ? '└─' : '├─';
        console.log(`${colors.cyan}║${colors.reset}    ${colors.gray}${bullet}${colors.reset} ${colors.cyan}${route.path.padEnd(20)}${colors.reset} ${colors.gray}${route.desc}${colors.reset} ${colors.cyan}║${colors.reset}`);
    });

    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╠══════════════════════════════════════════════════════════════════════╣${colors.reset}`);

    // Footer with instructions
    console.log(`${colors.cyan}║${colors.reset}  ${colors.gray}${new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })}${colors.reset}                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}⚠️  Press ${colors.bright}${colors.white}CTRL + C${colors.reset}${colors.yellow} to stop the server${colors.reset}                    ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('\n');

    // Initialize WhatsApp Manager and load active devices
    console.log(`${colors.cyan}╔══════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.white}📱 WHATSAPP MANAGER${colors.reset}                                             ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.gray}Loading previously connected devices...${colors.reset}                    ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.cyan}╚══════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('\n');

    try {
        const whatsappManager = require('./services/whatsappManager');
        await whatsappManager.loadActiveDevices();
    } catch (error) {
        console.error(`${colors.red}❌ Error initializing WhatsApp Manager:${colors.reset}`, error.message);
    }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, initiating graceful shutdown...');
    server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutdown requested, closing connections...');
    server.close(() => {
        console.log('✅ Server stopped successfully');
        process.exit(0);
    });
});

module.exports = app;