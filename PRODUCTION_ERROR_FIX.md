# 🔧 PRODUCTION ERROR FIX - Step by Step Guide

**Tanggal**: 11 November 2025  
**Status**: In Progress  
**Database**: Supabase PostgreSQL  

---

## 📋 DAFTAR ERROR YANG DITEMUKAN

Dari browser console dan Supabase dashboard:

1. ❌ **404 Error**: `coffee-texture.jpg` - File tidak ditemukan
2. ❌ **401 Error**: `api/auth/callback/credentials` - Authentication callback gagal
3. ⚠️ **Database**: REST Requests & Auth Requests terdeteksi di Supabase

---

## ✅ STEP-BY-STEP PERBAIKAN

### **STEP 1: Hilangkan Error coffee-texture.jpg** ✅ SELESAI

**Masalah**: File `coffee-texture.jpg` tidak ada di folder `public/`

**Solusi**: Mengganti background image dengan gradient CSS

**File yang diubah**: `src/components/dashboard/GuestLanding.jsx`

**Perubahan**:
```jsx
// SEBELUM:
<div className="absolute inset-0 bg-[url('/coffee-texture.jpg')] bg-cover bg-center opacity-30"></div>

// SESUDAH:
<div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-black to-zinc-900 opacity-50"></div>
```

**Status**: ✅ **FIXED** - Background sekarang menggunakan gradient, tidak perlu file eksternal

---

### **STEP 2: Perbaiki Error API Auth Callback** 🔄 IN PROGRESS

**Masalah**: Error 401 di `/api/auth/callback/credentials`

**Kemungkinan Penyebab**:
1. Environment variables tidak ter-set di Vercel
2. NEXTAUTH_SECRET tidak valid
3. NEXTAUTH_URL salah
4. Database connection gagal di production

**Solusi Step-by-Step**:

#### **2.1 Cek Environment Variables di Vercel**

1. Login ke Vercel Dashboard: https://vercel.com
2. Pilih project **Motiv-Company**
3. Klik tab **Settings** → **Environment Variables**
4. Pastikan SEMUA variable ini ada:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://motivcompany.vercel.app"

# Midtrans (jika sudah ada)
MIDTRANS_SERVER_KEY="your-midtrans-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION="false"
```

#### **2.2 Generate NEXTAUTH_SECRET yang Valid**

Jika `NEXTAUTH_SECRET` belum ada atau tidak valid:

**Cara 1 - Menggunakan Online Generator**:
1. Buka: https://generate-secret.vercel.app/32
2. Copy secret yang di-generate
3. Tambahkan ke Vercel Environment Variables

**Cara 2 - Menggunakan Terminal** (lebih aman):
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Atau menggunakan OpenSSL (jika ada)
openssl rand -base64 32
```

#### **2.3 Set NEXTAUTH_URL dengan Benar**

Di Vercel Environment Variables, set:
```
NEXTAUTH_URL = https://motivcompany.vercel.app
```

**PENTING**: 
- ✅ Gunakan `https://` bukan `http://`
- ✅ Tanpa trailing slash di akhir
- ✅ Sesuai dengan domain production Anda

#### **2.4 Verifikasi Database URL**

Pastikan `DATABASE_URL` dan `DIRECT_URL` sudah benar:

1. Login ke Supabase: https://supabase.com
2. Pilih project **Motiv Company**
3. Klik **Settings** → **Database**
4. Scroll ke **Connection String**

**DATABASE_URL** (Transaction Mode):
```
Format: postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**DIRECT_URL** (Session Mode):
```
Format: postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING**:
- Ganti `[password]` dengan password database Anda
- Jangan simpan di code, hanya di Environment Variables!

#### **2.5 Rebuild & Redeploy**

Setelah semua environment variables di-set:

1. Di Vercel Dashboard → Tab **Deployments**
2. Klik **"Redeploy"** pada deployment terakhir
3. Tunggu build selesai (2-5 menit)
4. Cek status: harus **"Ready"** dengan ✅

---

### **STEP 3: Cek Prisma Configuration** 🔄 NEXT

**File**: `prisma/schema.prisma`

**Pastikan binaryTargets sudah benar**:
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Status**: ✅ Sudah benar - `rhel-openssl-3.0.x` untuk Vercel

---

### **STEP 4: Verifikasi Build Script** 🔄 NEXT

**File**: `package.json`

**Pastikan build script sudah benar**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

**Status**: ✅ Sudah benar - Prisma akan generate sebelum build

---

### **STEP 5: Test API Endpoints** 🔄 PENDING

Setelah redeploy selesai, test API endpoints:

#### **5.1 Test Health Check**
```bash
# Test apakah server running
curl https://motivcompany.vercel.app/api/products
```

**Expected**: Response 200 OK dengan list produk

#### **5.2 Test Auth**
```bash
# Test login
curl -X POST https://motivcompany.vercel.app/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@motiv.com", "password": "Admin@Motiv123"}'
```

**Expected**: Response 200 OK dengan session token

#### **5.3 Test Database Connection**
- Login ke aplikasi dengan user admin
- Jika login berhasil → Database connection OK ✅
- Jika login gagal → Cek database credentials

---

## 🔍 TROUBLESHOOTING

### Error: "Callback for provider type credentials not supported"

**Penyebab**: NextAuth configuration issue

**Solusi**:
1. Pastikan `trustHost: true` ada di auth config
2. Verifikasi `NEXTAUTH_URL` sudah benar
3. Redeploy

### Error: "PrismaClient is unable to run in this browser environment"

**Penyebab**: Prisma Client digunakan di client-side

**Solusi**:
1. Pastikan semua Prisma query ada di:
   - API Routes (`src/app/api/**/route.js`)
   - Server Components
   - ViewModels (yang dipanggil dari server)
2. JANGAN panggil Prisma langsung dari:
   - Client Components
   - Browser JavaScript

### Error: "Database connection failed"

**Penyebab**: Environment variables salah

**Solusi**:
1. Cek `DATABASE_URL` di Vercel
2. Cek password database di Supabase
3. Test connection dari local menggunakan connection string yang sama

---

## 📊 CHECKLIST VERCEL DEPLOYMENT

Sebelum deploy, pastikan:

- [x] Prisma schema sudah benar
- [x] Binary targets include `rhel-openssl-3.0.x`
- [x] Build script include `prisma generate`
- [ ] Environment variables ter-set di Vercel:
  - [ ] DATABASE_URL
  - [ ] DIRECT_URL
  - [ ] NEXTAUTH_SECRET
  - [ ] NEXTAUTH_URL
- [ ] No hardcoded secrets di code
- [ ] All API routes menggunakan proper error handling
- [ ] Images/assets ada di `public/` folder

---

## 🎯 LANGKAH SELANJUTNYA

1. ✅ **STEP 1 SELESAI**: coffee-texture.jpg error dihilangkan
2. 🔄 **STEP 2 CURRENT**: Set environment variables di Vercel
3. ⏳ **STEP 3**: Rebuild & redeploy
4. ⏳ **STEP 4**: Test login & API endpoints
5. ⏳ **STEP 5**: Monitor error logs di Vercel

---

## 📝 CATATAN PENTING

### Environment Variables yang HARUS ada di Vercel:

```env
# Database (dari Supabase)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# NextAuth (generate baru jika belum ada)
NEXTAUTH_SECRET="[32-character random string]"
NEXTAUTH_URL="https://motivcompany.vercel.app"

# Midtrans (optional, untuk payment)
MIDTRANS_SERVER_KEY="[your-server-key]"
MIDTRANS_CLIENT_KEY="[your-client-key]"
MIDTRANS_IS_PRODUCTION="false"
```

### Cara Set di Vercel:

1. Dashboard → Settings → Environment Variables
2. Klik **"Add New"**
3. Masukkan:
   - **Name**: Nama variable (contoh: `DATABASE_URL`)
   - **Value**: Value dari variable
   - **Environment**: Pilih **Production**, **Preview**, dan **Development**
4. Klik **"Save"**
5. Ulangi untuk semua variables

### Setelah Semua Variable Di-Set:

1. Tab **Deployments** → Klik deployment terakhir
2. Klik **"⋯"** (three dots) → **"Redeploy"**
3. **Centang** "Use existing Build Cache" (optional, bisa unchecked untuk fresh build)
4. Klik **"Redeploy"**
5. Tunggu build selesai (2-5 menit)

---

## ✅ HASIL YANG DIHARAPKAN

Setelah semua step selesai:

1. ✅ Login page terbuka tanpa error console
2. ✅ No 404 errors (coffee-texture.jpg fixed)
3. ✅ Login berfungsi dengan kredensial:
   - Email: `admin@motiv.com`
   - Password: `Admin@Motiv123`
4. ✅ Dashboard admin muncul setelah login
5. ✅ API endpoints response 200 OK
6. ✅ Database connection stable

---

**Update Terakhir**: Step 1 selesai (coffee-texture.jpg removed)  
**Status Saat Ini**: Menunggu environment variables di-set di Vercel  
**Next Action**: Set NEXTAUTH_SECRET, NEXTAUTH_URL, DATABASE_URL, DIRECT_URL di Vercel Dashboard
