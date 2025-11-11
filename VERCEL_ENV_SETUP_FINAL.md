# 🚀 VERCEL ENVIRONMENT VARIABLES - FINAL SETUP

**URL Supabase**: `https://aaltkprawfanoajoevcsp.supabase.co`  
**Project Ref**: `aaltkprawfanoajoevcsp`

---

## ⚠️ ERROR YANG TERJADI

```
POST https://motivcompany.vercel.app/api/auth/callback/credentials 401 (Unauthorized)
```

**Penyebab**: Environment variables (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`) belum di-set di Vercel!

---

## ✅ LANGKAH-LANGKAH FIX

### **STEP 1: Dapatkan Connection String dari Supabase**

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. **Pilih Project**: Motiv Company (`aaltkprawfanoajoevcsp`)
3. **Klik**: Settings (⚙️) → Database → Connection String
4. **Copy kedua connection string**:

#### **Transaction Mode (untuk DATABASE_URL)**
```
Format: postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### **Session Mode (untuk DIRECT_URL)**
```
Format: postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING**: 
- `[ref]` = `aaltkprawfanoajoevcsp` (sudah ada)
- `[password]` = Password database Anda (GANTI INI!)

---

### **STEP 2: Set Environment Variables di Vercel**

**URL**: https://vercel.com/dashboard

1. **Login** ke Vercel
2. **Pilih project**: Motiv-Company
3. **Klik**: Settings → Environment Variables
4. **Tambahkan 4 variables** berikut:

---

#### **1️⃣ DATABASE_URL**

```
Name: DATABASE_URL

Value: postgresql://postgres.aaltkprawfanoajoevcsp:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

Environment: 
✓ Production
✓ Preview  
✓ Development
```

**⚠️ GANTI** `[YOUR_PASSWORD]` dengan password database Anda!

**Cara dapat password**:
- Supabase Dashboard → Settings → Database
- Atau cek email dari Supabase saat pertama kali buat project
- Atau reset password database jika lupa

---

#### **2️⃣ DIRECT_URL**

```
Name: DIRECT_URL

Value: postgresql://postgres.aaltkprawfanoajoevcsp:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

Environment:
✓ Production
✓ Preview
✓ Development
```

**⚠️ GANTI** `[YOUR_PASSWORD]` dengan password database yang SAMA seperti di atas!

---

#### **3️⃣ NEXTAUTH_SECRET**

```
Name: NEXTAUTH_SECRET

Value: QGT448AvJnJTO9K56fKSin8tlcEhEGCYnZ9BPNY3Xas=

Environment:
✓ Production
✓ Preview
✓ Development
```

**Catatan**: Secret ini sudah di-generate dari script `generate-nextauth-secret.js`

---

#### **4️⃣ NEXTAUTH_URL**

```
Name: NEXTAUTH_URL

Value: https://motivcompany.vercel.app

Environment:
✓ Production
✓ Preview
✓ Development
```

**⚠️ SESUAIKAN** jika domain production Anda berbeda!

---

### **STEP 3: (Optional) Supabase Service Role Key**

Jika Anda ingin menggunakan Supabase Admin API:

```
Name: SUPABASE_SERVICE_KEY

Value: [Copy dari Supabase → Settings → API → service_role (secret)]

Environment:
✓ Production
✓ Preview
✓ Development
```

**⚠️ JANGAN EXPOSE** service_role key ke client-side!

---

### **STEP 4: Verifikasi Environment Variables**

Setelah menambahkan semua variables, verifikasi:

1. **Klik**: Settings → Environment Variables
2. **Pastikan ada 4 variables**:
   - ✅ DATABASE_URL
   - ✅ DIRECT_URL
   - ✅ NEXTAUTH_SECRET
   - ✅ NEXTAUTH_URL
3. **Pastikan semua** ter-set untuk Production, Preview, dan Development

---

### **STEP 5: Redeploy**

**PENTING**: Environment variables baru **TIDAK** akan aktif sampai Anda redeploy!

1. **Klik tab**: Deployments
2. **Klik**: Deployment terakhir (paling atas)
3. **Klik**: "⋯" (three dots) → "Redeploy"
4. **UNCHECK**: "Use existing Build Cache" (untuk fresh build)
5. **Klik**: "Redeploy"
6. **Tunggu**: ±3-5 menit sampai status "Ready" ✅

---

### **STEP 6: Test Deployment**

Setelah deployment selesai (status "Ready"):

#### **Test 1: Health Check**
```
https://motivcompany.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "✅ OK",
  "environment": {
    "hasNextAuthSecret": true,    ← Harus true
    "hasNextAuthUrl": true,        ← Harus true
    "hasDatabaseUrl": true,        ← Harus true
    "nextAuthUrlValue": "https://motivcompany.vercel.app"
  }
}
```

**Jika ada yang `false`**: Environment variable belum ter-set dengan benar!

---

#### **Test 2: Database Connection**
```
https://motivcompany.vercel.app/api/test-db
```

**Expected Response**:
```json
{
  "success": true,
  "message": "✅ All tests passed!",
  "dbTest": {
    "current_time": "2025-11-11T...",
    "db_version": "PostgreSQL 15..."
  },
  "adminUser": {
    "exists": true,
    "email": "admin@motiv.com",
    "role": "ADMIN"
  }
}
```

**Jika error**:
- Cek DATABASE_URL dan DIRECT_URL sudah benar
- Cek password database sudah diganti
- Cek connection string masih valid di Supabase

---

#### **Test 3: Login Page**
```
https://motivcompany.vercel.app/login
```

1. **Email**: `admin@motiv.com`
2. **Password**: `Admin@Motiv123`
3. **Klik**: Sign In

**Expected**: Redirect ke dashboard admin ✅

**Jika error 401**:
- Cek browser console untuk detail error
- Cek Vercel logs: Deployments → Latest → Runtime Logs
- Pastikan NEXTAUTH_SECRET dan NEXTAUTH_URL sudah di-set

---

## 🔍 TROUBLESHOOTING

### ❌ Error: "Database connection failed"

**Penyebab**: DATABASE_URL atau DIRECT_URL salah

**Solusi**:
1. **Cek format** connection string:
   ```
   postgresql://postgres.aaltkprawfanoajoevcsp:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
2. **Pastikan password** sudah diganti dari `[YOUR_PASSWORD]` ke password asli
3. **Test connection** dari local:
   ```bash
   cd e:\Skripsi\motiv
   $env:DATABASE_URL="postgresql://..."
   node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✅')).catch(e => console.error('❌', e))"
   ```

---

### ❌ Error: "Callback for provider type credentials not supported"

**Penyebab**: NEXTAUTH_URL tidak sesuai atau NEXTAUTH_SECRET tidak ada

**Solusi**:
1. **Pastikan NEXTAUTH_URL** persis: `https://motivcompany.vercel.app`
2. **Tanpa trailing slash** di akhir
3. **Harus https** bukan http
4. **Redeploy** setelah set environment variables

---

### ❌ Error 401: "Unauthorized" saat login

**Kemungkinan Penyebab**:
1. Environment variables belum di-set
2. Belum redeploy setelah set environment variables
3. Password database salah di DATABASE_URL
4. NEXTAUTH_SECRET atau NEXTAUTH_URL salah

**Solusi**:
1. **Cek** `/api/health` → pastikan semua `true`
2. **Cek** `/api/test-db` → pastikan success
3. **Redeploy** dengan fresh build (uncheck build cache)
4. **Clear browser cache** & cookies
5. **Test** dengan Incognito/Private mode

---

### ❌ Build Failed di Vercel

**Kemungkinan Penyebab**:
1. Prisma generate gagal
2. Environment variables belum ada saat build

**Solusi**:
1. **Cek Build Logs** di Vercel untuk detail error
2. **Pastikan** `package.json` ada:
   ```json
   "scripts": {
     "build": "prisma generate && next build",
     "postinstall": "prisma generate"
   }
   ```
3. **Redeploy** dengan fresh build

---

## 📝 CARA MUDAH: Copy-Paste Ready

### **Template untuk DATABASE_URL**:
```
postgresql://postgres.aaltkprawfanoajoevcsp:GANTI_DENGAN_PASSWORD_ANDA@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### **Template untuk DIRECT_URL**:
```
postgresql://postgres.aaltkprawfanoajoevcsp:GANTI_DENGAN_PASSWORD_ANDA@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**CARA PAKAI**:
1. Copy template di atas
2. Ganti `GANTI_DENGAN_PASSWORD_ANDA` dengan password database Anda
3. Paste ke Vercel Environment Variables

---

## ✅ CHECKLIST

Sebelum test, pastikan:

- [ ] ✅ DATABASE_URL di-set di Vercel dengan password yang benar
- [ ] ✅ DIRECT_URL di-set di Vercel dengan password yang benar
- [ ] ✅ NEXTAUTH_SECRET di-set di Vercel
- [ ] ✅ NEXTAUTH_URL di-set di Vercel
- [ ] ✅ Semua variables ter-set untuk Production, Preview, Development
- [ ] ✅ Redeploy selesai dengan status "Ready"
- [ ] ✅ /api/health return semua `true`
- [ ] ✅ /api/test-db return `success: true`
- [ ] ✅ Login page accessible
- [ ] ✅ Login dengan admin berhasil

---

## 🎯 EXPECTED RESULT

Setelah semua setup:

1. ✅ No 404 errors (coffee-texture.jpg fixed)
2. ✅ No 500 errors (API error handling fixed)
3. ✅ No 401 errors (NextAuth configured properly)
4. ✅ Login berfungsi dengan credentials yang benar
5. ✅ Dashboard admin accessible
6. ✅ All APIs return proper responses

---

## 📞 JIKA MASIH ERROR

Screenshot dan share:
1. ✅ Response dari `/api/health`
2. ✅ Response dari `/api/test-db`
3. ✅ Browser console error (F12 → Console)
4. ✅ Vercel Runtime Logs (Deployments → Latest → Runtime Logs)
5. ✅ Vercel Environment Variables (screenshot dari Settings)

---

**Last Update**: 11 Nov 2025  
**Status**: Waiting for environment variables setup & redeploy  
**Next Action**: Set env vars → Redeploy → Test `/api/health` → Test login
