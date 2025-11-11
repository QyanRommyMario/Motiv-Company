# ⚡ CARA IMPORT ENVIRONMENT VARIABLES KE VERCEL

## 📋 OPTION 1: Import Satu-satu (Manual)

1. **Buka**: https://vercel.com/dashboard
2. **Pilih project**: Motiv-Company
3. **Klik**: Settings → Environment Variables
4. **Klik**: "Add New"

### Copy-paste setiap variable berikut:

#### 1️⃣ DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres.aaltkprawfanoajoevcsp:gs8ynqel74prbtxr@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 2️⃣ DIRECT_URL
```
Name: DIRECT_URL
Value: postgresql://postgres.aaltkprawfanoajoevcsp:gs8ynqel74prbtxr@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
Environment: ✓ Production ✓ Preview ✓ Development
```

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

#### 5️⃣ NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://aaltkprawfanoajoevcsp.supabase.co
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 6️⃣ NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhbHRrcHJhd2Zhbm9ham9ldmNzcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMwNzA5ODc4LCJleHAiOjIwNDYyODU4Nzh9.qxLtL0P6rQEO8zzQdBcH_K3RbVvxQCJxXJNSdCQZ7hE
Environment: ✓ Production ✓ Preview ✓ Development
```

---

## 📋 OPTION 2: Import via Vercel CLI (Lebih Cepat)

### Install Vercel CLI (jika belum):
```bash
npm i -g vercel
```

### Login:
```bash
vercel login
```

### Link project:
```bash
cd e:\Skripsi\motiv
vercel link
```

### Import environment variables:
```bash
vercel env pull .env.production
```

---

## 🚀 SETELAH IMPORT

### Redeploy:
1. Go to: https://vercel.com/dashboard
2. Tab: Deployments
3. Klik deployment terakhir
4. Klik: "⋯" → "Redeploy"
5. **UNCHECK**: "Use existing Build Cache"
6. Klik: "Redeploy"
7. Wait: ~3-5 minutes

---

## ✅ VERIFIKASI

### Test 1: Health Check
```
https://motivcompany.vercel.app/api/health
```

**Expected**:
```json
{
  "status": "✅ OK",
  "environment": {
    "hasNextAuthSecret": true,
    "hasNextAuthUrl": true,
    "hasDatabaseUrl": true
  }
}
```

### Test 2: Database Connection
```
https://motivcompany.vercel.app/api/test-db
```

**Expected**:
```json
{
  "success": true,
  "adminUser": {
    "email": "admin@motiv.com",
    "role": "ADMIN"
  }
}
```

### Test 3: Login
```
https://motivcompany.vercel.app/login
```

- Email: `admin@motiv.com`
- Password: `Admin@Motiv123`
- Should: Login berhasil ✅

---

## 📝 CHECKLIST

- [ ] DATABASE_URL di-set
- [ ] DIRECT_URL di-set
- [ ] NEXTAUTH_SECRET di-set
- [ ] NEXTAUTH_URL di-set
- [ ] NEXT_PUBLIC_SUPABASE_URL di-set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY di-set
- [ ] Redeploy selesai
- [ ] /api/health return all true
- [ ] /api/test-db return success
- [ ] Login works

---

**Password Database**: `gs8ynqel74prbtxr` ✅ (Sudah ter-set di semua connection string)
