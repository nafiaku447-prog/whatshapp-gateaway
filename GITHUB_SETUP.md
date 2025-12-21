# 📦 PUSH PROJECT KE GITHUB - STEP BY STEP

## ✅ FILE YANG SUDAH DIBUAT:
- `.gitignore` - File/folder yang di-ignore
- `backend/.env.example` - Template environment variables  
- `README.md` - Dokumentasi project

---

## 🚀 LANGKAH-LANGKAH

### 1️⃣ **Cek Git terinstall**

```bash
git --version
```

Jika error, download Git: https://git-scm.com/download/win

---

### 2️⃣ **Initialize Git Repository**

```bash
# Masuk ke folder project
cd "c:\laragon\www\wa api"

# Initialize git
git init

# Configure git (ganti dengan nama & email Anda)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

### 3️⃣ **Add Files ke Git**

```bash
# Add semua file (kecuali yang di .gitignore)
git add .

# Check status
git status
```

**Output akan tampilkan:**
- ✅ File yang akan di-commit (warna hijau)
- ⚠️ File yang diabaikan tidak akan muncul

---

### 4️⃣ **Commit Changes**

```bash
git commit -m "Initial commit: WA Gateway project"
```

---

### 5️⃣ **Create GitHub Repository**

**A. Via Website:**
1. Buka: https://github.com/new
2. Repository name: `wa-gateway`
3. Description: `WhatsApp API Gateway Indonesia - Self Hosted`
4. **PENTING:** 
   - ✅ Public atau Private (pilih sesuai kebutuhan)
   - ❌ JANGAN centang "Add README" (sudah ada)
   - ❌ JANGAN centang ".gitignore" (sudah ada)
5. Click "Create repository"

**B. Via GitHub CLI (optional):**
```bash
# Install GitHub CLI dulu: https://cli.github.com/
gh repo create wa-gateway --public --source=. --remote=origin
```

---

### 6️⃣ **Connect Local ke GitHub**

Copy command dari GitHub (setelah create repo), contoh:

```bash
# Add remote (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/wa-gateway.git

# Rename branch to main
git branch -M main

# Push ke GitHub
git push -u origin main
```

---

### 7️⃣ **Verify**

Buka browser:
```
https://github.com/USERNAME/wa-gateway
```

✅ Project Anda sudah di GitHub!

---

## ⚠️ **PENTING: CEK FILE SENSITIF**

Sebelum push, **PASTIKAN** file ini **TIDAK** ter-upload:

```bash
# Check file yang akan di-commit
git status

# Cek .gitignore working
git check-ignore -v backend/.env
git check-ignore -v backend/.wwebjs_auth/
git check-ignore -v wa_credentials.txt
```

**Harus output:** `File is ignored by .gitignore`

Jika file sensitif ter-commit:
```bash
# Remove dari git (tapi tidak delete file)
git rm --cached backend/.env
git rm --cached -r backend/.wwebjs_auth/

# Commit ulang
git commit -m "Remove sensitive files"
git push
```

---

## 🔐 **FILE YANG HARUS DI .gitignore:**

✅ **SUDAH OTOMATIS DIABAIKAN:**
- `backend/.env` - Database password, JWT secret
- `backend/.wwebjs_auth/` - WhatsApp session
- `node_modules/` - Dependencies
- `*.log` - Log files
- `wa_credentials.txt` - Credentials
- `uploads/` - User uploads

❌ **JANGAN SAMPAI KE-UPLOAD:**
- Password apapun
- API keys/tokens production
- Database credentials
- WhatsApp session files

---

## 📝 **BEST PRACTICES**

### **Commit Message Format:**
```bash
git commit -m "feat: add new feature"
git commit -m "fix: bug pada send message"
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"
```

### **Regular Updates:**
```bash
# Add changes
git add .

# Commit
git commit -m "update: description of changes"

# Push
git push
```

### **Check Before Push:**
```bash
# Review changes
git diff

# Review staged files
git status

# Review commit history
git log --oneline -5
```

---

## 🚀 **NEXT STEPS - SETELAH DI GITHUB:**

### **1. Deploy Frontend ke Vercel:**
```bash
vercel
# Pilih repository GitHub yang baru dibuat
```

### **2. Deploy Backend ke Railway:**
1. Buka https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Pilih repository `wa-gateway`
4. Pilih folder `backend`
5. Add environment variables
6. Deploy!

### **3. Update API URL:**
Setelah backend deploy, update di frontend:
```javascript
// js/api.js
const API_BASE_URL = 'https://wa-gateway-production.railway.app';
```

Commit & push lagi:
```bash
git add js/api.js
git commit -m "update: API URL to production"
git push
```

Vercel akan auto-redeploy! ✨

---

## ❓ **TROUBLESHOOTING**

### Error: "Permission denied (publickey)"
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub: Settings → SSH keys
cat ~/.ssh/id_ed25519.pub
```

### Error: "Repository not found"
```bash
# Check remote URL
git remote -v

# Update remote URL
git remote set-url origin https://github.com/USERNAME/wa-gateway.git
```

### Forgot to add file to .gitignore
```bash
# Remove from git (keep file)
git rm --cached filename

# Update .gitignore
echo "filename" >> .gitignore

# Commit
git add .gitignore
git commit -m "fix: add filename to gitignore"
```

---

**Ready? Jalankan command di terminal! 🚀**
