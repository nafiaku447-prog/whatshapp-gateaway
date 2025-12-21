# 🚀 WA Gateway Backend - PostgreSQL Setup

Backend API untuk WhatsApp Gateway dengan Node.js, Express, dan PostgreSQL.

## 📋 Prerequisites

Pastikan sudah terinstall:
- **Node.js** (v16 atau lebih baru)
- **PostgreSQL** (v12 atau lebih baru)
- **npm** atau **yarn**

## 🔧 Installation Steps

### 1. Install PostgreSQL (jika belum)

**Windows:**
```bash
# Download PostgreSQL dari: https://www.postgresql.org/download/windows/
# Install dan catat password untuk user postgres
```

**Cek instalasi:**
```bash
psql --version
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:
```bash
copy .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here  # Ganti dengan password postgres Anda
DB_NAME=wa_gateway

# JWT Secret (ubah dengan random string)
JWT_SECRET=your-super-secret-jwt-key-123456789
```

### 4. Create Database

Buat database baru di PostgreSQL:

**Option 1: Via psql command line**
```bash
psql -U postgres
CREATE DATABASE wa_gateway;
\q
```

**Option 2: Via pgAdmin**
- Buka pgAdmin
- Klik kanan pada Databases
- Pilih "Create" > "Database"
- Nama: `wa_gateway`
- Save

### 5. Run Database Schema

Import schema ke database:

```bash
# Via psql
psql -U postgres -d wa_gateway -f schema.sql

# Atau via command line
type schema.sql | psql -U postgres -d wa_gateway
```

### 6. Verify Database Setup

Check apakah tables sudah dibuat:
```bash
psql -U postgres -d wa_gateway -c "\dt"
```

Anda harus melihat daftar tables seperti:
- users
- subscription_plans
- devices
- contacts
- messages
- dll.

## 🏃 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server akan running di: **http://localhost:5000**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Messages
- `POST /api/messages/send` - Send message
- `GET /api/messages` - Get message history
- `GET /api/messages/:id` - Get message details

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Add new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Statistics
- `GET /api/stats/dashboard` - Get dashboard stats
- `GET /api/stats/messages` - Get message statistics

## 🧪 Testing the API

### Test dengan cURL:

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\": \"John\", \"lastName\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"081234567890\", \"password\": \"password123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"john@example.com\", \"password\": \"password123\"}"
```

### Test dengan Postman:
1. Import collection (akan dibuat terpisah)
2. Test semua endpoints
3. Pastikan authentication working

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── db.js                  # Database connection
├── schema.sql             # Database schema
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Environment template
├── middleware/
│   └── auth.js           # JWT authentication
├── routes/
│   ├── auth.js           # Auth routes
│   ├── users.js          # User routes
│   ├── devices.js        # Device routes
│   ├── contacts.js       # Contact routes
│   ├── messages.js       # Message routes
│   ├── webhooks.js       # Webhook routes
│   └── statistics.js     # Stats routes
├── utils/
│   └── helpers.js        # Helper functions
└── scripts/
    └── init-db.js        # Database initialization script
```

## 🔐 Security Features

- ✅ Helmet.js for security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection with parameterized queries
- ✅ Input validation with express-validator

## 🐛 Troubleshooting

### Error: "password authentication failed"
```bash
# Check PostgreSQL service is running
# Reset postgres password jika lupa
```

### Error: "database does not exist"
```bash
# Buat database terlebih dahulu
psql -U postgres -c "CREATE DATABASE wa_gateway;"
```

### Error: "Port 5000 already in use"
```bash
# Ubah PORT di .env file
PORT=5001
```

### Error: "Cannot find module"
```bash
# Install ulang dependencies
npm install
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | wa_gateway |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `CORS_ORIGIN` | Allowed origins | * |

## 🔄 Next Steps

1. ✅ Setup database
2. ✅ Run server
3. ⏳ Connect frontend
4. ⏳ Implement message sending
5. ⏳ Add WhatsApp integration
6. ⏳ Deploy to production

## 📞 Support

Jika ada masalah, cek:
- PostgreSQL service running
- .env configuration correct
- Database tables created
- Dependencies installed

## 🎯 Quick Start Checklist

- [ ] PostgreSQL installed
- [ ] Database `wa_gateway` created
- [ ] Schema imported
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Server running on port 5000
- [ ] Health check returns OK

---

**Happy Coding! 🚀**
