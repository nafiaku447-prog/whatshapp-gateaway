# Multi-stage build untuk optimasi ukuran image
FROM node:18-alpine AS builder

# Install dependencies yang diperlukan untuk whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chromium executable path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

# Install Chromium dan dependencies untuk whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    ttf-liberation \
    wqy-zenhei

# Set Chromium executable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

# Create app directory
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy application files
COPY backend ./backend
COPY *.html ./
COPY css ./css
COPY js ./js
COPY docs ./docs

# Create necessary directories with proper permissions
RUN mkdir -p /app/backend/.wwebjs_auth \
    /app/backend/.wwebjs_cache \
    /app/backend/uploads && \
    chmod -R 755 /app/backend/.wwebjs_auth \
    /app/backend/.wwebjs_cache \
    /app/backend/uploads

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set working directory to backend
WORKDIR /app/backend

# Start application
CMD ["node", "server.js"]
