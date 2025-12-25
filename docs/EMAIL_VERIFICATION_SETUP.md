# Email Verification Login - Setup Guide

Fitur email verification telah ditambahkan ke sistem login WA Gateway. Setiap kali user login, mereka akan menerima kode OTP (One-Time Password) 6 digit ke email mereka yang harus dimasukkan untuk menyelesaikan proses login.

## Fitur yang Ditambahkan

### 1. **Frontend (login.html)**
- ✅ Form login dengan email dan password
- ✅ Form verifikasi email dengan input kode OTP 6 digit
- ✅ Countdown timer 60 detik untuk resend kode
- ✅ Tombol "Kirim Ulang Kode" dengan cooldown
- ✅ Tombol "Kembali ke Login"
- ✅ Validasi kode OTP (hanya angka, 6 digit)
- ✅ UI yang modern dan responsive

### 2. **Backend Routes (routes/auth.js)**
- ✅ `POST /api/auth/login-verify` - Validasi credentials dan kirim OTP
- ✅ `POST /api/auth/verify-otp` - Verifikasi kode OTP
- ✅ `POST /api/auth/resend-otp` - Kirim ulang kode OTP
- ✅ `POST /api/auth/login` - Legacy login tanpa verifikasi (masih aktif)

### 3. **Email Service (utils/emailService.js)**
- ✅ Generate OTP 6 digit
- ✅ Kirim email HTML yang profesional
- ✅ Template email dengan design modern

## Konfigurasi Email SMTP

Untuk mengaktifkan fitur ini, Anda perlu mengkonfigurasi SMTP di file `.env`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
APP_NAME=WA Gateway
```

### Cara Setup Gmail SMTP:

1. **Login ke Gmail** Anda
2. **Aktifkan 2-Factor Authentication** (jika belum)
3. **Buat App Password:**
   - Buka https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan device "Other"
   - Masukkan nama (misal: "WA Gateway")
   - Copy password yang dihasilkan
   - Paste ke `SMTP_PASS` di file `.env`

4. **Lengkapi konfigurasi:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # App password dari step 3
   APP_NAME=WA Gateway
   ```

### Alternatif Provider SMTP Lainnya:

#### **Mailtrap** (Untuk Testing)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

#### **SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### **Mailgun**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

## Flow Proses Login

1. **User memasukkan email dan password** → Klik "Masuk"
2. **Backend validasi credentials:**
   - Cek email di database
   - Validasi password dengan bcrypt
   - Jika valid, generate OTP 6 digit
   - Simpan OTP ke memory (berlaku 10 menit)
   - Kirim OTP ke email user
3. **Frontend menampilkan form verifikasi:**
   - User menerima email dengan kode OTP
   - User memasukkan kode 6 digit
   - Start countdown timer 60 detik
4. **User memasukkan OTP** → Klik "Verifikasi"
5. **Backend verifikasi OTP:**
   - Cek apakah OTP valid
   - Cek apakah OTP belum kadaluarsa
   - Jika valid, generate JWT token
   - Return user data dan token
6. **Redirect ke dashboard**

## Keamanan

- ✅ OTP disimpan di memory (Map) - **Production: gunakan Redis**
- ✅ OTP kadaluarsa setelah 10 menit
- ✅ Email HTML mencantumkan warning keamanan
- ✅ Rate limiting untuk mencegah spam
- ✅ Password di-hash dengan bcryptjs
- ✅ JWT token untuk session management

## Testing

### 1. **Test Login Flow:**
```bash
# 1. Login dengan credentials
POST /api/auth/login-verify
{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "message": "Kode verifikasi telah dikirim ke email Anda",
  "email": "user@example.com"
}

# 2. Cek email Anda dan dapatkan kode OTP

# 3. Verifikasi OTP
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "code": "123456"
}

# Response:
{
  "message": "Verifikasi berhasil",
  "user": { ... },
  "token": "jwt-token-here"
}
```

### 2. **Test Resend OTP:**
```bash
POST /api/auth/resend-otp
{
  "email": "user@example.com"
}

# Response:
{
  "message": "Kode verifikasi baru telah dikirim ke email Anda"
}
```

## Troubleshooting

### Email tidak terkirim?

1. **Cek konfigurasi SMTP di `.env`**
2. **Cek console log backend** untuk error message
3. **Pastikan App Password Gmail sudah benar**
4. **Cek spam/junk folder** di email
5. **Test dengan Mailtrap** untuk development

### Kode OTP selalu invalid?

1. **Cek console log** untuk melihat OTP yang di-generate
2. **Pastikan tidak ada typo** saat input
3. **Cek apakah OTP sudah kadaluarsa** (10 menit)

### Countdown tidak berfungsi?

1. **Clear browser cache**
2. **Hard reload** (Ctrl + Shift + R)

## Production Recommendations

1. **Gunakan Redis** untuk OTP storage daripada Map
2. **Implementasi rate limiting** yang lebih ketat untuk `/login-verify` dan `/resend-otp`
3. **Log semua attempts** untuk security monitoring
4. **Gunakan dedicated email service** (SendGrid, AWS SES, Mailgun)
5. **Implementasi CAPTCHA** untuk mencegah bot attacks
6. **Database table** untuk audit trail

## Next Steps (Optional Enhancements)

- [ ] Implementasi Redis untuk OTP storage
- [ ] Add CAPTCHA verification
- [ ] SMS OTP sebagai fallback
- [ ] Biometric login (fingerprint, face ID)
- [ ] Remember device feature
- [ ] Email templates yang dapat dikustomisasi
- [ ] Multi-language support
- [ ] Login attempt logging
- [ ] IP-based rate limiting
- [ ] 2FA dengan authenticator app

---

**Dibuat:** 22 Desember 2024  
**Version:** 1.0.0
