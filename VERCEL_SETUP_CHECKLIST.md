# ✅ Vercel Environment Variables Checklist

## 🔐 WAJIB Ada di Vercel (Settings → Environment Variables)

### 1. Database Connection (Supabase)
```env
DATABASE_URL=postgresql://postgres.aaltkprawfanoajoevcp:9O8VxKMNJHABzNXW@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres:9O8VxKMNJHABzNXW@db.aaltkprawfanoajoevcp.supabase.co:5432/postgres
```
**Environment:** ☑️ Production ☑️ Preview ☑️ Development

---

### 2. NextAuth Configuration
```env
NEXTAUTH_SECRET=pkapjLG5+DUaY3yrjMKCfc80wexTamSWaVQFi8sxoKs=

NEXTAUTH_URL=https://motivcompany.vercel.app
```
**Environment untuk NEXTAUTH_URL:**
- Production: `https://motivcompany.vercel.app`
- Preview: `https://motivcompany-[hash].vercel.app` (bisa pakai wildcard)
- Development: `http://localhost:3000`

**PENTING:** Pastikan `NEXTAUTH_URL` **PERSIS SAMA** dengan URL production (tanpa trailing slash `/`)

---

### 3. Midtrans Payment Gateway
```env
MIDTRANS_SERVER_KEY=your-server-key-here
MIDTRANS_CLIENT_KEY=your-client-key-here
MIDTRANS_IS_PRODUCTION=false

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-client-key-here
NEXT_PUBLIC_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```
**Environment:** ☑️ Production ☑️ Preview ☑️ Development

---

## 🗄️ Setup Database di Supabase

### Cara 1: Via Supabase SQL Editor (RECOMMENDED - Paling Mudah)

1. Buka: https://supabase.com/dashboard/project/aaltkprawfanoajoevcp/editor
2. Klik **"SQL Editor"** di sidebar
3. Klik **"New query"**
4. Copy-paste SQL schema dari file `SUPABASE_MIGRATION.sql` (akan dibuat di bawah)
5. Klik **"Run"** (Ctrl+Enter)
6. ✅ Database ready!

### Cara 2: Via Vercel Build Hook (Auto saat deploy)

Tambahkan di `package.json`:
```json
"scripts": {
  "build": "prisma generate && prisma db push --accept-data-loss && next build"
}
```

⚠️ **WARNING:** `--accept-data-loss` akan override data existing. Hati-hati di production!

### Cara 3: Via Prisma Studio (Manual)

```bash
# Di local, set env ke Supabase
$env:DATABASE_URL="postgresql://postgres:9O8VxKMNJHABzNXW@db.aaltkprawfanoajoevcp.supabase.co:5432/postgres"

# Push schema
npx prisma db push

# Seed data
npx prisma db seed
```

---

## 🔧 Fix NextAuth Configuration Error

Error `?error=Configuration` biasanya karena:

1. **Missing `NEXTAUTH_SECRET`**
2. **Wrong `NEXTAUTH_URL`** (harus persis dengan domain)
3. **Missing `NEXTAUTH_URL` di Production environment**

### Solusi:

Di Vercel → Settings → Environment Variables:

1. Cek `NEXTAUTH_SECRET` ada di **Production**
2. Cek `NEXTAUTH_URL` untuk Production = `https://motivcompany.vercel.app` (TANPA trailing `/`)
3. Setelah update, klik **"Redeploy"**

---

## 📊 Verify Database Connection

### Test Connection di Supabase:

1. Buka: https://supabase.com/dashboard/project/aaltkprawfanoajoevcp/editor
2. Klik **"Table Editor"**
3. Lihat apakah ada tables: User, Product, Order, dll
4. Kalau **KOSONG** → Database belum di-migrate

### Create Tables via SQL Editor:

Lihat file `SUPABASE_MIGRATION.sql` untuk complete schema.

---

## 🚀 Deploy Checklist

- [ ] All environment variables added di Vercel
- [ ] `NEXTAUTH_URL` = `https://motivcompany.vercel.app` (Production)
- [ ] Database tables created di Supabase
- [ ] Seed data (admin user, sample products)
- [ ] Redeploy Vercel
- [ ] Test login dengan admin credentials

---

## 🆘 Troubleshooting

### Error: "Configuration"
→ Check `NEXTAUTH_URL` dan `NEXTAUTH_SECRET` di Vercel

### Error: "prisma.user is not a function"
→ Database tables belum ada, run migration di Supabase

### Error: "Can't reach database server"
→ Check `DATABASE_URL` format dan password

### Login failed / No users
→ Perlu seed database dengan admin user
