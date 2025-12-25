# Admin Dashboard - System Monitor Documentation

## 📊 Overview

Admin Dashboard adalah halaman khusus untuk **Admin** yang menampilkan **real-time monitoring** performa server, termasuk **CPU, RAM, Disk, dan Proses** yang berjalan.

## 🎯 Fitur Utama

### ✅ Monitoring Real-Time
- **CPU Usage** - Persentase penggunaan CPU dengan detail per core
- **Memory Usage** - Penggunaan RAM (used/total)
- **Disk Usage** - Penggunaan storage disk
- **Process Information** - Jumlah proses yang berjalan
- **System Info** - OS, Platform, Hostname, Uptime

### ✅ Visual Indicators
- **Progress Bars** - Visual representation penggunaan resource
- **Color-Coded Status:**
  - 🟢 **Hijau (Normal)** - CPU < 50%, RAM < 70%, Disk < 80%
  - 🟡 **Kuning (Warning)** - CPU 50-80%, RAM 70-90%, Disk 80-95%
  - 🔴 **Merah (Critical)** - CPU > 80%, RAM > 90%, Disk > 95%

### ✅ Charts & Graphs
- **CPU Usage History** - Line chart dengan 20 data points terakhir
- **Memory Usage History** - Line chart tracking penggunaan RAM
- **Auto-Update** - Charts update otomatis setiap 5 detik

### ✅ Auto-Refresh
- **Real-time Updates** - Data refresh otomatis setiap 5 detik
- **Countdown Timer** - Indicator waktu refresh berikutnya
- **Toggle Control** - Bisa dimatikan/dihidupkan manual

## 📁 Struktur File

```
waapi/
├── admin-dashboard.html           # Halaman dashboard
├── css/
│   └── admin-dashboard.css        # Styling dashboard
├── js/
│   └── admin-dashboard.js         # Logic dashboard
└── backend/
    ├── routes/
    │   └── systemStats.js         # API routes
    ├── middleware/
    │   └── adminAuth.js           # Admin authentication
    └── migrations/
        └── add_admin_column.sql   # Database migration
```

## 🔌 API Endpoints

### 1. Get System Stats (Comprehensive)
```
GET /api/system/system-stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "timestamp": "2024-12-22T08:00:00.000Z",
  "cpu": {
    "usage": 45.2,
    "cores": 8,
    "model": "Intel Core i7-9700K",
    "speed": "3.6 GHz",
    "loadPerCore": [
      { "load": 40.5 },
      { "load": 50.2 }
    ],
    "status": "normal"
  },
  "memory": {
    "used": "8.5 GB",
    "total": "16 GB",
    "free": "7.5 GB",
    "percent": 53.12,
    "usedBytes": 9126805504,
    "totalBytes": 17179869184,
    "status": "normal"
  },
  "disk": {
    "used": "250 GB",
    "total": "500 GB",
    "free": "250 GB",
    "percent": 50.0,
    "drives": [
      {
        "mount": "C:",
        "fs": "NTFS",
        "type": "NTFS",
        "size": "500 GB",
        "used": "250 GB",
        "percent": 50.0
      }
    ],
    "status": "normal"
  },
  "os": {
    "platform": "win32",
    "distro": "Windows 10 Pro",
    "release": "10.0.19045",
    "arch": "x64",
    "hostname": "MY-COMPUTER",
    "uptime": "2d 5h 30m"
  },
  "network": {
    "interface": "Ethernet",
    "rxSec": "1.5 MB/s",
    "txSec": "500 KB/s"
  },
  "processes": {
    "all": 234,
    "running": 12,
    "blocked": 0,
    "sleeping": 222
  }
}
```

### 2. Get CPU Stats Only
```
GET /api/system/cpu-stats
Authorization: Bearer {token}
```

### 3. Get Memory Stats Only
```
GET /api/system/memory-stats
Authorization: Bearer {token}
```

## 🔐 Security & Access Control

### Admin Authentication

Dashboard hanya bisa diakses oleh user dengan **role admin**. Backend akan melakukan:

1. **Token Verification** - Check JWT token validity
2. **Admin Role Check** - Verify `is_admin = true` di database
3. **403 Response** - Jika user bukan admin

### Middleware Flow:
```javascript
Request → JWT Verify → Get User → Check is_admin → Allow/Deny
```

## 🚀 Cara Setup

### 1. Install Dependencies
```bash
cd backend
npm install systeminformation
```

### 2. Run Database Migration
```sql
-- Connect to PostgreSQL
psql -U postgres -d waapi_db

-- Run migration
\i backend/migrations/add_admin_column.sql
```

Atau manual:
```sql
-- Add admin column
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set user pertama jadi admin
UPDATE users SET is_admin = TRUE WHERE id = 1;
```

### 3. Set User Sebagai Admin (Manual)
```sql
-- Via SQL
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';

-- Cek admin users
SELECT id, email, first_name, last_name, is_admin 
FROM users 
WHERE is_admin = TRUE;
```

### 4. Start Server
```bash
cd backend
npm start
# atau
npm run dev
```

### 5. Access Dashboard
```
http://localhost:5000/admin-dashboard.html
```

**Login sebagai admin**, lalu buka URL di atas.

## 📊 Cara Kerja

### Frontend Flow:
```
1. Page Load
   ↓
2. Check Authentication (JWT token)
   ↓
3. Check Admin Access (API call)
   ↓
4. Initialize Charts (Chart.js)
   ↓
5. Fetch Initial Data
   ↓
6. Start Auto-Refresh (every 5s)
   ↓
7. Update UI & Charts
```

### Backend Flow:
```
1. Receive Request
   ↓
2. Verify JWT Token
   ↓
3. Get User from Database
   ↓
4. Check is_admin = true
   ↓
5. Collect System Stats (systeminformation)
   ↓
6. Format Response
   ↓
7. Send JSON
```

### Data Collection (systeminformation):
```javascript
// CPU
await si.currentLoad()      // Current CPU usage
await si.cpu()              // CPU info

// Memory
await si.mem()              // Memory usage

// Disk
await si.fsSize()           // File system sizes

// OS
await si.osInfo()           // OS information
os.uptime()                 // System uptime

// Network
await si.networkStats()     // Network statistics

// Processes
await si.processes()        // Process information
```

## 🎨 UI Components

### Cards
- **CPU Card** - Blue gradient icon
- **Memory Card** - Green gradient icon
- **Disk Card** - Orange gradient icon
- **System Info Card** - Purple gradient icon

### Interactive Elements
- **Progress Bars** - Animated width transition
- **Status Indicators** - Pulsing dot animation
- **Charts** - Smooth line animations
- **Auto-refresh Toggle** - Enable/disable real-time updates

### Responsive Design
- **Desktop** - 4-column grid
- **Tablet** - 2-column grid
- **Mobile** - 1-column layout

## ⚙️ Configuration

### Refresh Interval
Edit `js/admin-dashboard.js`:
```javascript
const REFRESH_INTERVAL = 5000; // 5 seconds (default)
```

### Chart History
```javascript
const MAX_CHART_DATA_POINTS = 20; // Last 20 readings
```

### Status Thresholds
Edit `backend/routes/systemStats.js`:
```javascript
// CPU
if (usage < 50) return 'normal';
if (usage < 80) return 'warning';
return 'critical';

// Memory
if (percent < 70) return 'normal';
if (percent < 90) return 'warning';
return 'critical';

// Disk
if (percent < 80) return 'normal';
if (percent < 95) return 'warning';
return 'critical';
```

## 🔧 Troubleshooting

### 1. Access Denied / 403 Error
**Problem:** User bukan admin

**Solution:**
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

### 2. Data Tidak Muncul
**Problem:** API error atau token expired

**Solution:**
- Logout dan login kembali
- Check browser console untuk error
- Verify backend server running

### 3. Charts Tidak Update
**Problem:** Auto-refresh disabled atau error

**Solution:**
- Click toggle auto-refresh button
- Check console for errors
- Hard refresh (Ctrl + Shift + R)

### 4. Disk Stats Error (Linux)
**Problem:** Permission denied reading disk info

**Solution:**
- Run server with proper permissions
- Check `/proc` filesystem access

## 🌍 Platform Support

### ✅ Windows
- Full support
- CPU, RAM, Disk, Process monitoring
- NTFS file system detection

### ✅ Linux
- Full support
- ext4, xfs, btrfs support
- Process monitoring via `/proc`

### ✅ macOS
- Full support
- APFS support
- Process monitoring

## 🔮 Future Enhancements

- [ ] **Network Traffic Graph** - Real-time network monitoring
- [ ] **Process List** - Top processes by CPU/Memory
- [ ] **Alerts & Notifications** - Email/SMS when threshold exceeded
- [ ] **Historical Data** - Save stats to database
- [ ] **Export Reports** - PDF/Excel export
- [ ] **Multi-Server Monitoring** - Monitor multiple servers
- [ ] **Custom Dashboards** - User-defined layouts
- [ ] **Dark Mode** - Toggle theme
- [ ] **Mobile App** - React Native app

## 📝 Notes

1. **Production:** Gunakan Redis untuk caching jika monitoring banyak server
2. **Security:** Pastikan hanya admin yang bisa akses
3. **Performance:** Monitor setiap 5 detik tidak memberatkan server
4. **Database:** `is_admin` column sudah di-index untuk performa

## 🆘 Support

Jika ada masalah:
1. Check console logs (Frontend & Backend)
2. Verify user is admin in database
3. Check systeminformation library compatibility
4. Review API response in Network tab

---

**Created:** 22 Desember 2024  
**Version:** 1.0.0  
**Author:** WA Gateway Team
