# 🚀 QUICK FIX GUIDE - Production Errors

## ✅ YANG SUDAH DIPERBAIKI (Code)

1. ✅ **Frontend**: Removed coffee-texture.jpg (404 error fixed)
2. ✅ **Backend**: Added centralized error handler
3. ✅ **APIs**: Stories & Products API improved error handling
4. ✅ **Utilities**: NEXTAUTH_SECRET generator ready

## ⚠️ YANG HARUS DILAKUKAN (Vercel Dashboard)

### LANGKAH 1: Set Environment Variables

**URL**: https://vercel.com/dashboard → Pilih project **Motiv-Company** → Settings → Environment Variables

**Tambahkan variable berikut** (klik "Add New" untuk setiap variable):

#### 1️⃣ DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 2️⃣ DIRECT_URL
```
Name: DIRECT_URL  
Value: postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
Environment: ✓ Production ✓ Preview ✓ Development
```

**📍 Cara dapat connection string**:
1. Login https://supabase.com
2. Pilih project "Motiv Company"
3. Settings → Database → Connection String
4. **GANTI** `[password]` dengan password database Anda!

#### 3️⃣ NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: QGT448AvJnJTO9K56fKSin8tlcEhEGCYnZ9BPNY3Xas=
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 4️⃣ NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://motivcompany.vercel.app
Environment: ✓ Production ✓ Preview ✓ Development
```

**⚠️ SESUAIKAN** dengan domain production Anda!

---

### LANGKAH 2: Redeploy

Setelah semua variable di-set:

1. Klik tab **"Deployments"**
2. Klik deployment terakhir (paling atas)
3. Klik **"⋯"** (three dots) → **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Klik **"Redeploy"**
6. Tunggu ±3-5 menit

---

### LANGKAH 3: Test

Buka URL berikut untuk verify:

✅ **Health Check**:
```
https://motivcompany.vercel.app/api/health
```
Harus return `hasNextAuthSecret: true`, `hasDatabaseUrl: true`

✅ **Database Test**:
```
https://motivcompany.vercel.app/api/test-db
```
Harus return `success: true`

✅ **Login**:
```
https://motivcompany.vercel.app/login
```
- Email: `admin@motiv.com`
- Password: `Admin@Motiv123`

Harus bisa login dan redirect ke dashboard!

---

## 📋 CHECKLIST

- [x] Code fixed & pushed to GitHub
- [ ] DATABASE_URL di-set di Vercel
- [ ] DIRECT_URL di-set di Vercel
- [ ] NEXTAUTH_SECRET di-set di Vercel
- [ ] NEXTAUTH_URL di-set di Vercel
- [ ] Redeploy completed
- [ ] /api/health return OK
- [ ] /api/test-db return success
- [ ] Login working

---

## 🆘 JIKA MASIH ERROR

### Error: "Database connection failed"
→ Cek DATABASE_URL dan DIRECT_URL sudah benar
→ Pastikan `[password]` sudah diganti dengan password asli

### Error: "Unauthorized" saat login
→ Cek NEXTAUTH_SECRET dan NEXTAUTH_URL sudah di-set
→ Redeploy setelah set environment variables

### Build failed di Vercel
→ Cek Vercel logs untuk detail error
→ Pastikan `prisma generate` running di build process

---

## 📞 NEED HELP?

Screenshot dan share:
1. Error dari browser console (F12)
2. Vercel deployment logs
3. Response dari `/api/health`
4. Response dari `/api/test-db`

---

**Last Update**: 11 Nov 2025  
**Status**: Code ready, waiting for Vercel env setup
