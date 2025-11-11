# ⚡ QUICK FIX - Error 401 Unauthorized

## 🔴 ERROR
```
POST /api/auth/callback/credentials 401 (Unauthorized)
```

## ✅ SOLUSI 3 LANGKAH

### **1️⃣ DAPATKAN PASSWORD DATABASE**

Buka: https://supabase.com/dashboard/project/aaltkprawfanoajoevcsp/settings/database

- Jika lupa password → Klik **"Reset database password"**
- **SIMPAN** password yang baru!

---

### **2️⃣ SET DI VERCEL**

Buka: https://vercel.com/qyanrommymario/motiv-company/settings/environment-variables

Tambahkan 4 variables (klik "Add New"):

| Name | Value | Env |
|------|-------|-----|
| `DATABASE_URL` | `postgresql://postgres.aaltkprawfanoajoevcsp:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | ✓ Production ✓ Preview ✓ Development |
| `DIRECT_URL` | `postgresql://postgres.aaltkprawfanoajoevcsp:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` | ✓ Production ✓ Preview ✓ Development |
| `NEXTAUTH_SECRET` | `QGT448AvJnJTO9K56fKSin8tlcEhEGCYnZ9BPNY3Xas=` | ✓ Production ✓ Preview ✓ Development |
| `NEXTAUTH_URL` | `https://motivcompany.vercel.app` | ✓ Production ✓ Preview ✓ Development |

**⚠️ GANTI** `[PASSWORD]` dengan password database dari step 1!

---

### **3️⃣ REDEPLOY**

1. Buka: https://vercel.com/qyanrommymario/motiv-company/deployments
2. Klik deployment terakhir → "⋯" → **"Redeploy"**
3. **Uncheck** "Use existing Build Cache"
4. Klik **"Redeploy"**
5. Tunggu ±3-5 menit

---

## ✅ TEST

Setelah deployment selesai (status "Ready"):

1. **Health Check**: https://motivcompany.vercel.app/api/health
   - Semua harus `true`

2. **Database Test**: https://motivcompany.vercel.app/api/test-db
   - Harus `success: true`

3. **Login**: https://motivcompany.vercel.app/login
   - Email: `admin@motiv.com`
   - Password: `Admin@Motiv123`

---

## 🆘 MASIH ERROR?

**Jika /api/health return false**:
→ Environment variable belum ter-set atau salah

**Jika /api/test-db error**:
→ Password database salah di DATABASE_URL

**Jika login 401**:
→ Belum redeploy setelah set environment variables

---

**Need Help?** Screenshot:
- `/api/health` response
- `/api/test-db` response
- Vercel environment variables page
