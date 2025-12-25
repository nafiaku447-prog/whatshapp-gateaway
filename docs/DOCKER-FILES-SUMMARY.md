# 🐳 Docker Files Summary

Dokumentasi lengkap tentang semua file Docker yang telah dibuat untuk project WA Gateway.

## 📁 File Structure

```
waapi/
├── 🐳 Docker Configuration Files
│   ├── Dockerfile                    # Production Dockerfile
│   ├── Dockerfile.dev               # Development Dockerfile (dengan hot-reload)
│   ├── docker-compose.yml           # Production compose file
│   ├── docker-compose.dev.yml       # Development compose file
│   ├── .dockerignore                # Files yang diabaikan saat build
│   └── .env.docker                  # Template environment variables
│
├── 🛠️ Helper Scripts
│   ├── docker.ps1                   # Windows PowerShell helper script
│   └── docker.sh                    # Linux/Mac Bash helper script
│
└── 📖 Documentation
    ├── README-DOCKER.md             # Dokumentasi lengkap Docker
    └── DOCKER-QUICKSTART.md         # Quick start guide
```

## 📄 File Details

### 1. `Dockerfile` (Production)

**Purpose**: Build optimized Docker image untuk production

**Features**:
- Multi-stage build untuk image size yang lebih kecil
- Alpine Linux untuk lightweight
- Chromium pre-installed untuk whatsapp-web.js
- Non-root user untuk security
- Health check built-in
- Production dependencies only

**Usage**:
```bash
docker build -f Dockerfile -t waapi-backend .
```

---

### 2. `Dockerfile.dev` (Development)

**Purpose**: Build Docker image untuk development dengan hot-reload

**Features**:
- Include devDependencies (nodemon)
- Mounted volumes untuk source code
- Hot-reload dengan nodemon
- Faster rebuild time

**Usage**:
```bash
docker build -f Dockerfile.dev -t waapi-backend-dev .
```

---

### 3. `docker-compose.yml` (Production)

**Purpose**: Orchestrate multiple containers untuk production deployment

**Services**:
- **postgres**: PostgreSQL 15 database
- **backend**: Node.js application
- **pgadmin**: Database management UI (optional, profile: tools)

**Features**:
- Health checks untuk semua services
- Volume persistence untuk data
- Network isolation
- Auto-restart policies
- Database initialization dengan SQL script

**Usage**:
```bash
# Start all services
docker-compose up -d

# Start with pgAdmin
docker-compose --profile tools up -d

# Stop services
docker-compose down
```

---

### 4. `docker-compose.dev.yml` (Development)

**Purpose**: Orchestrate containers untuk development

**Services**:
- **postgres**: Development database
- **backend**: Backend dengan hot-reload
- **pgadmin**: Always included

**Features**:
- Source code mounting untuk hot-reload
- nodemon untuk auto-restart
- Development-friendly configuration
- Separate volumes dari production

**Usage**:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

### 5. `.dockerignore`

**Purpose**: Exclude files dari Docker build context

**Excludes**:
- node_modules
- .env files
- .git directory
- logs
- session files
- uploads
- documentation

**Benefits**:
- Faster build time
- Smaller build context
- Better security (no sensitive files)

---

### 6. `.env.docker`

**Purpose**: Template untuk environment variables

**Contains**:
- Database configuration
- JWT settings
- SMTP/Email settings
- Google OAuth settings
- Application settings

**Usage**:
```bash
# Windows
Copy-Item .env.docker .env

# Linux/Mac
cp .env.docker .env
```

**Important**: WAJIB edit dan ganti semua nilai default!

---

### 7. `docker.ps1` (Windows Helper)

**Purpose**: Simplify Docker commands untuk Windows users

**Commands**:
- `setup` - Setup .env file
- `build` - Build images
- `start` - Start containers
- `stop` - Stop containers
- `restart` - Restart containers
- `logs` - Show logs
- `status` - Show container status
- `clean` - Remove containers
- `rebuild` - Full rebuild
- `backup-db` - Backup database
- `shell` - Access backend shell
- `psql` - Access PostgreSQL shell

**Usage**:
```powershell
.\docker.ps1 [command]
```

---

### 8. `docker.sh` (Linux/Mac Helper)

**Purpose**: Simplify Docker commands untuk Linux/Mac users

**Features**: Same as docker.ps1 but for Bash

**Usage**:
```bash
chmod +x docker.sh
./docker.sh [command]
```

---

### 9. `README-DOCKER.md`

**Purpose**: Comprehensive Docker documentation

**Contents**:
- Prerequisites
- Installation guide
- Configuration details
- Command reference
- Troubleshooting
- Production deployment guide
- Security best practices
- Monitoring tips

---

### 10. `DOCKER-QUICKSTART.md`

**Purpose**: Quick start guide untuk pemula

**Contents**:
- 3-step quick start
- Common commands
- Basic troubleshooting
- Links to detailed docs

---

## 🚀 Common Workflows

### First Time Setup (Production)

```bash
# 1. Setup environment
.\docker.ps1 setup     # Windows
./docker.sh setup      # Linux/Mac

# 2. Edit .env file
# Ganti DB_PASSWORD, JWT_SECRET, SMTP credentials

# 3. Start containers
.\docker.ps1 start     # Windows
./docker.sh start      # Linux/Mac

# 4. Access app
# http://localhost:5000
```

### Development Mode

```bash
# 1. Setup environment
cp .env.docker .env
# Edit .env

# 2. Start dev mode
docker-compose -f docker-compose.dev.yml up -d

# 3. Watch logs
docker-compose -f docker-compose.dev.yml logs -f backend

# 4. Make changes to code
# Changes will auto-reload!
```

### Switching Between Production & Development

```bash
# Stop production
docker-compose down

# Start development
docker-compose -f docker-compose.dev.yml up -d

# Or vice versa
docker-compose -f docker-compose.dev.yml down
docker-compose up -d
```

### Database Backup & Restore

```bash
# Backup
.\docker.ps1 backup-db                                    # Windows
./docker.sh backup-db                                     # Linux/Mac

# Manual backup
docker exec waapi-postgres pg_dump -U waapi_user waapi_db > backup.sql

# Restore
docker exec -i waapi-postgres psql -U waapi_user waapi_db < backup.sql
```

## 🔧 Customization

### Change Port

Edit `.env`:
```env
APP_PORT=8080
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Add More Environment Variables

1. Add to `.env.docker` template
2. Add to `docker-compose.yml` environment section
3. Rebuild:
```bash
docker-compose down
docker-compose up -d
```

### Use Different Database

Edit `docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16-alpine  # Change version
    # or use MySQL, MariaDB, etc.
```

## 🐛 Common Issues

### Port Already in Use

```bash
# Check what's using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Kill process or change port in .env
```

### Database Connection Failed

```bash
# Wait for database to be ready
docker-compose logs postgres

# Check health
docker inspect --format='{{.State.Health.Status}}' waapi-postgres
```

### WhatsApp Session Lost

Sessions are stored in Docker volumes. Don't remove volumes:
```bash
# See volumes
docker volume ls | grep waapi

# NEVER run this unless you want to reset sessions:
# docker volume rm waapi_whatsapp_sessions
```

### Build Cache Issues

```bash
# Full rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Volumes

### Data Persistence

All important data is persisted in Docker volumes:

- `waapi_postgres_data` - Database data
- `waapi_whatsapp_sessions` - WhatsApp session files
- `waapi_whatsapp_cache` - WhatsApp cache
- `waapi_uploads_data` - Uploaded files
- `waapi_pgadmin_data` - pgAdmin configuration

### Backup Volumes

```bash
# List volumes
docker volume ls

# Backup a volume
docker run --rm -v waapi_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore a volume
docker run --rm -v waapi_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🔒 Security Notes

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Use app password for Gmail SMTP
- [ ] Don't commit `.env` to git
- [ ] Use HTTPS with reverse proxy
- [ ] Enable firewall rules
- [ ] Regularly update Docker images
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly

### Docker Security

- Non-root user in container
- Network isolation
- Read-only mounts where possible
- Resource limits (optional)
- Regular image updates
- Vulnerability scanning

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [WhatsApp Web.js Docs](https://wwebjs.dev/)

## 🆘 Getting Help

1. Check logs: `docker-compose logs -f`
2. Check health: `docker-compose ps`
3. Read troubleshooting section
4. Check README-DOCKER.md
5. Create issue on GitHub

---

**Created**: 2024
**Last Updated**: 2024-12-25
**Version**: 1.0.0
