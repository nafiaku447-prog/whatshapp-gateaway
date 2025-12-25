# 🐳 WA Gateway - Docker Deployment Guide

Panduan lengkap untuk menjalankan WA Gateway menggunakan Docker dan Docker Compose.

## 📋 Prerequisites

Pastikan sudah terinstall:
- **Docker** (v20.10+): [Download Docker](https://www.docker.com/get-started)
- **Docker Compose** (v2.0+): Biasanya sudah termasuk dalam Docker Desktop

Untuk mengecek versi yang terinstall:
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

### 1. Clone atau Download Project

Jika belum punya project:
```bash
git clone <repository-url>
cd waapi
```

### 2. Setup Environment Variables

Copy file environment template dan sesuaikan dengan kebutuhan Anda:

```bash
# Windows (PowerShell)
Copy-Item .env.docker .env

# Linux/Mac
cp .env.docker .env
```

Kemudian edit file `.env` dan **WAJIB** ganti nilai berikut:
- `DB_PASSWORD` - Password database PostgreSQL
- `JWT_SECRET` - Secret key untuk JWT (minimal 32 karakter random)
- `SMTP_USER` dan `SMTP_PASS` - Kredensial email Anda

**Contoh `.env` yang sudah disesuaikan:**
```env
DB_USER=waapi_user
DB_PASSWORD=MySecureP@ssw0rd2024!
DB_NAME=waapi_db
JWT_SECRET=aB3dF6hJ9kL2nQ5sT8vW1xZ4cE7gI0mO5pR8uY1zA4bC7eF0hJ3
SMTP_USER=myemail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### 3. Build dan Jalankan

Jalankan semua services (database + backend):

```bash
docker-compose up -d
```

Perintah ini akan:
- ✅ Download image PostgreSQL
- ✅ Build Docker image untuk aplikasi backend
- ✅ Membuat network dan volumes
- ✅ Menjalankan database dan aplikasi
- ✅ Menginisialisasi database dengan schema

### 4. Verifikasi

Cek status containers:
```bash
docker-compose ps
```

Output seharusnya menunjukkan:
```
NAME                IMAGE                  STATUS
waapi-backend       waapi-backend          Up (healthy)
waapi-postgres      postgres:15-alpine     Up (healthy)
```

Cek logs untuk memastikan tidak ada error:
```bash
docker-compose logs -f backend
```

### 5. Akses Aplikasi

Setelah semua berjalan, buka browser:

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📦 Docker Commands Cheat Sheet

### Manajemen Container

```bash
# Start semua services
docker-compose up -d

# Stop semua services
docker-compose down

# Stop dan hapus volumes (HATI-HATI: Data akan hilang!)
docker-compose down -v

# Restart services
docker-compose restart

# Restart hanya backend
docker-compose restart backend

# Stop sementara tanpa menghapus container
docker-compose stop

# Start kembali setelah stop
docker-compose start
```

### Monitoring & Debugging

```bash
# Lihat logs semua services
docker-compose logs -f

# Lihat logs hanya backend
docker-compose logs -f backend

# Lihat logs hanya database
docker-compose logs -f postgres

# Lihat logs 100 baris terakhir
docker-compose logs --tail=100 backend

# Cek status dan resources
docker stats

# Masuk ke dalam container backend
docker exec -it waapi-backend sh

# Masuk ke PostgreSQL
docker exec -it waapi-postgres psql -U waapi_user -d waapi_db
```

### Build & Update

```bash
# Rebuild image setelah perubahan code
docker-compose build backend

# Rebuild tanpa cache (full rebuild)
docker-compose build --no-cache backend

# Rebuild dan restart
docker-compose up -d --build
```

### Database Management

```bash
# Backup database
docker exec waapi-postgres pg_dump -U waapi_user waapi_db > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i waapi-postgres psql -U waapi_user waapi_db < backup.sql

# Akses PostgreSQL CLI
docker exec -it waapi-postgres psql -U waapi_user -d waapi_db

# Reset database (HATI-HATI!)
docker-compose down
docker volume rm waapi_postgres_data
docker-compose up -d
```

## 🛠️ Advanced Configuration

### Menggunakan pgAdmin (Database GUI)

Untuk menjalankan pgAdmin:

```bash
# Start dengan pgAdmin
docker-compose --profile tools up -d

# Akses pgAdmin di browser
# http://localhost:5050
# Email: admin@waapi.local
# Password: admin123 (sesuai .env)
```

**Koneksi ke PostgreSQL dari pgAdmin:**
- Host: `postgres`
- Port: `5432`
- Database: `waapi_db`
- Username: `waapi_user`
- Password: (sesuai dengan `DB_PASSWORD` di `.env`)

### Custom Port

Jika port 5000 sudah digunakan, ubah di file `.env`:

```env
APP_PORT=8080
```

Kemudian restart:
```bash
docker-compose down
docker-compose up -d
```

### Production Mode

Untuk production, pastikan:

1. **Ganti semua secrets** di `.env`:
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `SMTP_PASS`

2. **Set NODE_ENV** ke production:
   ```env
   NODE_ENV=production
   ```

3. **Gunakan reverse proxy** seperti Nginx atau Traefik

4. **Enable HTTPS** dengan SSL certificate

### Volume Management

Data persistent disimpan di Docker volumes:

```bash
# List semua volumes
docker volume ls | grep waapi

# Inspect volume
docker volume inspect waapi_postgres_data

# Backup volume
docker run --rm -v waapi_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v waapi_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🐛 Troubleshooting

### Container tidak start

```bash
# Cek logs error
docker-compose logs backend
docker-compose logs postgres

# Cek port conflict
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Rebuild dari awal
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection error

```bash
# Cek apakah database sudah healthy
docker-compose ps

# Cek koneksi database
docker exec waapi-postgres pg_isready -U waapi_user

# Reset database
docker-compose down
docker volume rm waapi_postgres_data
docker-compose up -d
```

### WhatsApp session hilang

WhatsApp sessions disimpan di volume `waapi_whatsapp_sessions`. Jangan hapus volume ini jika ingin mempertahankan sessions.

```bash
# List volumes
docker volume ls

# JANGAN run ini jika ingin keep sessions:
# docker volume rm waapi_whatsapp_sessions
```

### Chromium/Puppeteer error

Jika ada error terkait Chromium:

```bash
# Rebuild dengan no-cache
docker-compose build --no-cache backend
docker-compose up -d
```

### Out of Memory

Jika aplikasi crash karena memory:

```bash
# Tambahkan memory limit di docker-compose.yml
services:
  backend:
    ...
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Permission Issues

Jika ada masalah permission pada volumes:

```bash
# Fix permission di Linux/Mac
sudo chown -R 1001:1001 ./backend/.wwebjs_auth
sudo chown -R 1001:1001 ./backend/.wwebjs_cache
```

## 🔒 Security Best Practices

1. **Jangan commit file `.env`** ke git
2. **Ganti semua default passwords**
3. **Gunakan strong JWT_SECRET** (minimal 32 karakter random)
4. **Enable firewall** dan hanya buka port yang diperlukan
5. **Update images secara berkala**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
6. **Gunakan Docker secrets** untuk production
7. **Scan images untuk vulnerabilities**:
   ```bash
   docker scan waapi-backend
   ```

## 📊 Monitoring

### Health Checks

Docker Compose sudah include health checks:

```bash
# Cek health status
docker inspect --format='{{.State.Health.Status}}' waapi-backend
docker inspect --format='{{.State.Health.Status}}' waapi-postgres
```

### Resource Usage

```bash
# Monitor resources real-time
docker stats waapi-backend waapi-postgres

# Detailed container info
docker inspect waapi-backend
```

## 🚀 Deployment

### Deploy ke Production Server

1. **Setup server** dengan Docker installed
2. **Copy project files** ke server
3. **Setup `.env`** dengan production values
4. **Setup reverse proxy** (Nginx recommended)
5. **Start containers**:
   ```bash
   docker-compose up -d
   ```

### Deploy dengan Nginx Reverse Proxy

Contoh konfigurasi Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Auto-restart dengan systemd

Buat file `/etc/systemd/system/waapi.service`:

```ini
[Unit]
Description=WA Gateway Docker Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/waapi
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable dan start:
```bash
sudo systemctl enable waapi
sudo systemctl start waapi
```

## 📝 Notes

- **WhatsApp sessions** akan persistent di Docker volume
- **Database data** akan persistent di Docker volume
- **Uploads** akan persistent di Docker volume
- Container berjalan sebagai **non-root user** untuk keamanan
- Logs dapat dilihat dengan `docker-compose logs`

## 🆘 Support

Jika mengalami masalah:
1. Cek logs: `docker-compose logs -f`
2. Cek health: `docker-compose ps`
3. Baca troubleshooting section di atas
4. Buat issue di repository

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Happy Dockerizing! 🐳**
