# 🔧 FIX: Add DIRECT_URL to Vercel

## ❌ Masalah Saat Ini:
Prisma tidak bisa connect ke Supabase di Vercel meskipun:
- ✅ Build sukses
- ✅ Environment variables ada
- ❌ Runtime connection gagal (500 error)

## ✅ Solusi: Tambah DIRECT_URL Environment Variable

Supabase memerlukan 2 connection strings:
1. **DATABASE_URL** (Pooler) - Untuk query biasa
2. **DIRECT_URL** (Direct) - Untuk migrations & direct queries

### 📋 Steps:

#### 1. Buka Vercel Dashboard
```
https://vercel.com/dashboard
```

#### 2. Pilih Project "Motiv-Company"

#### 3. Settings → Environment Variables

#### 4. Add New Variable:

**Name:**
```
DIRECT_URL
```

**Value:**
```
postgresql://postgres:9O8VxKMNJHABzNXW@db.aaltkprawfanoajoevcp.supabase.co:5432/postgres
```

**Environments:** ☑️ Production ☑️ Preview ☑️ Development

#### 5. Click "Save"

#### 6. Redeploy

**Option A - Trigger New Deployment:**
- Di Vercel Dashboard → Deployments
- Klik deployment terakhir
- Klik "..." → Redeploy

**Option B - Git Push (Easier):**
Saya akan push commit baru yang akan auto-trigger redeploy.

---

## 🎯 Kenapa Ini Perlu?

### Supabase Connection Modes:

| Mode | URL | Purpose |
|------|-----|---------|
| **Pooler** (6543) | `aws-0-ap-southeast-1.pooler.supabase.com:6543` | Connection pooling via PgBouncer |
| **Direct** (5432) | `db.aaltkprawfanoajoevcp.supabase.co:5432` | Direct PostgreSQL connection |

### Prisma + Supabase Requirements:

- **Query operations** → DATABASE_URL (pooler OK)
- **Migrations & schema operations** → DIRECT_URL (needs direct connection)
- **Serverless (Vercel)** → NEEDS BOTH!

---

## 📱 After Adding DIRECT_URL:

1. ✅ Vercel akan restart dengan env var baru
2. ✅ Prisma akan gunakan direct connection
3. ✅ Database connection akan berhasil
4. ✅ `/api/test-db` akan return success
5. ✅ Login akan berhasil!

---

## 🚀 Quick Action:

**SEKARANG:**
1. Buka Vercel: https://vercel.com/qyanrommymario01-1763s-projects/motivcompany/settings/environment-variables
2. Add variable: `DIRECT_URL`
3. Value: `postgresql://postgres:9O8VxKMNJHABzNXW@db.aaltkprawfanoajoevcp.supabase.co:5432/postgres`
4. Save
5. **Screenshot** halaman environment variables
6. Kirim ke saya
7. Saya akan push commit untuk trigger redeploy

**Atau langsung screenshot environment variables page** dan saya akan guide step-by-step!
