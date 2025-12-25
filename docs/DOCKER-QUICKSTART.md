# 🚀 Quick Start Guide - Docker

Panduan singkat untuk menjalankan WA Gateway dengan Docker dalam 5 menit!

## 📋 Prerequisites

Pastikan sudah terinstall:
- [Docker Desktop](https://www.docker.com/get-started) (Windows/Mac)
- atau Docker Engine + Docker Compose (Linux)

## ⚡ Quick Start (5 Menit)

### 1️⃣ Setup Environment

**Windows (PowerShell):**
```powershell
.\docker.ps1 setup
```

**Linux/Mac:**
```bash
chmod +x docker.sh
./docker.sh setup
```

Kemudian edit file `.env` dan **WAJIB** ganti:
- `DB_PASSWORD` → Password database yang kuat
- `JWT_SECRET` → String random minimal 32 karakter
- `SMTP_USER` → Email Gmail Anda
- `SMTP_PASS` → App Password Gmail ([Cara buat](https://support.google.com/accounts/answer/185833))

### 2️⃣ Build & Start

**Windows:**
```powershell
.\docker.ps1 start
```

**Linux/Mac:**
```bash
./docker.sh start
```

### 3️⃣ Akses Aplikasi

Tunggu ~30 detik sampai semua container ready, kemudian buka:

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## ✅ Verifikasi

Cek apakah semua berjalan:

**Windows:**
```powershell
.\docker.ps1 status
```

**Linux/Mac:**
```bash
./docker.sh status
```

Output seharusnya:
```
NAME              STATUS
waapi-backend     Up (healthy)
waapi-postgres    Up (healthy)
```

## 🎯 Common Commands

### Windows (PowerShell)

```powershell
# Lihat logs
.\docker.ps1 logs

# Stop containers
.\docker.ps1 stop

# Restart containers
.\docker.ps1 restart

# Backup database
.\docker.ps1 backup-db

# Lihat semua commands
.\docker.ps1 help
```

### Linux/Mac (Bash)

```bash
# Lihat logs
./docker.sh logs

# Stop containers
./docker.sh stop

# Restart containers
./docker.sh restart

# Backup database
./docker.sh backup-db

# Lihat semua commands
./docker.sh help
```

## 🔧 Manual Commands (Tanpa Helper Script)

Jika tidak ingin pakai helper script:

```bash
# Setup
cp .env.docker .env
# Edit .env file

# Build dan start
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop
docker-compose down

# Status
docker-compose ps
```

## 🐛 Troubleshooting

### Port 5000 sudah digunakan?

Edit `.env` dan ganti:
```env
APP_PORT=8080
```

Kemudian restart:
```bash
docker-compose down
docker-compose up -d
```

### Database connection error?

Tunggu beberapa detik lagi, database sedang initialize. Cek logs:
```bash
docker-compose logs postgres
```

### Container tidak start?

Cek logs untuk detail error:
```bash
docker-compose logs backend
```

Rebuild dari awal:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Dokumentasi Lengkap

Untuk informasi lebih detail, baca [README-DOCKER.md](README-DOCKER.md)

## 🆘 Need Help?

1. Cek logs: `docker-compose logs -f`
2. Cek health: `docker-compose ps`
3. Baca [README-DOCKER.md](README-DOCKER.md)
4. Buat issue di repository

---

**That's it! Selamat menggunakan WA Gateway! 🎉**
