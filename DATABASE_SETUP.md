# 📦 DATABASE SETUP - SIMPLE GUIDE

## ✅ **1 FILE SQL SAJA!**

Gunakan file ini untuk setup database lengkap:
```
backend/database-complete.sql
```

**Isi:**
- ✅ 13 Tables lengkap
- ✅ API Key support
- ✅ Google OAuth support
- ✅ QR Code support
- ✅ Indexes & Triggers
- ✅ Default subscription plans

---

## 🚀 **CARA PAKAI**

### **Local (PostgreSQL di Komputer)**

```bash
# 1. Create database
createdb wa_gateway

# 2. Import SQL (SEKALI JALAN!)
psql wa_gateway < backend/database-complete.sql

# 3. Done! ✅
```

---

### **Render.com (FREE)**

```bash
# 1. Copy Database URL dari Render
export DATABASE_URL="postgres://user:pass@host/db"

# 2. Import SQL
psql $DATABASE_URL < backend/database-complete.sql

# 3. Done! ✅
```

---

### **Railway ($10/month)**

```bash
# Via Railway CLI
railway run psql < backend/database-complete.sql

# Atau via connection string
psql "postgresql://user:pass@host/db" < backend/database-complete.sql
```

---

### **Neon / Supabase (FREE)**

```bash
# Copy connection string & run
psql "your_connection_string_here" < backend/database-complete.sql
```

---

## ✅ **VERIFY**

```sql
-- Cek jumlah tables (harus 13)
\dt

-- Cek subscription plans (harus 8)
SELECT COUNT(*) FROM subscription_plans;
```

---

## 🎯 **NEXT: UPDATE .ENV**

```env
DB_HOST=your_host
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=wa_gateway
```

---

**That's it! Simple kan? 🚀**
