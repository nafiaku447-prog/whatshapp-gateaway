# 🚀 WA Gateway - WhatsApp API Gateway Indonesia

WhatsApp API Gateway self-hosted untuk mengirim notifikasi, broadcast, bot otomatis, dan reminder melalui WhatsApp.

## ✨ Features

- 📱 **Multi-Device Support** - Kelola banyak WhatsApp device
- 💬 **Send Messages** - Kirim text, images, videos, documents
- 🤖 **Auto Reply Bot** - Bot otomatis dengan keyword detection  
- 📊 **Dashboard** - Web interface untuk manage devices & messages
- 🔐 **Secure Auth** - JWT + Device Token authentication
- 📈 **Analytics** - Track messages dan statistik
- 🪝 **Webhooks** - Receive incoming messages
- 🔗 **RESTful API** - Easy integration

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive design
- Modern UI/UX

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- whatsapp-web.js
- JWT authentication

## 📋 Prerequisites

- Node.js v16+ 
- PostgreSQL v12+
- WhatsApp account
- (Optional) Google OAuth credentials

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/wa-gateway.git
cd wa-gateway
```

### 2️⃣ Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan credentials Anda
nano .env
```

### 3️⃣ Setup Database

```bash
# Create database
createdb wa_gateway

# Import schema
psql wa_gateway < schema.sql
```

### 4️⃣ Run Development

```bash
# Start backend server
npm run dev
```

Backend akan jalan di: `http://localhost:5000`

### 5️⃣ Open Frontend

Buka browser dan akses:
```
http://localhost/wa-gateway/
```

atau gunakan live server untuk development.

## 🚀 Deployment

### Frontend (Vercel - FREE)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend (Railway - $10/month)

1. Push code ke GitHub
2. Connect Railway to GitHub repo
3. Add backend folder
4. Set environment variables
5. Deploy!

**Deployment guide lengkap:** [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)

## 📚 API Documentation

Full API documentation: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Quick Start

**Send Message:**
```bash
curl -X POST http://localhost:5000/api/send \
  -H "X-API-Key: YOUR_DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"6281234567890","message":"Hello!"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "...",
    "device": {"id": 1, "name": "Device 1"},
    "recipient": "6281234567890",
    "status": "sent"
  }
}
```

## 🔐 Environment Variables

Create `.env` file in `backend/` folder:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=wa_gateway

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# Server
PORT=5000
NODE_ENV=development

# Frontend (for CORS)
FRONTEND_URL=http://localhost
```

## 📱 Usage

1. **Register/Login** - Create account or login
2. **Add Device** - Add WhatsApp device
3. **Scan QR Code** - Connect WhatsApp
4. **Get API Token** - Copy device API token
5. **Send Messages** - Use API to send messages!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - WhatsApp Web API
- [Express.js](https://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Database

## 📞 Support

- Documentation: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Issues: [GitHub Issues](https://github.com/yourusername/wa-gateway/issues)
- Email: support@wagateway.com

## ⭐ Star this repo

If you find this project useful, please give it a star! ⭐

---

Made with ❤️ in Indonesia
