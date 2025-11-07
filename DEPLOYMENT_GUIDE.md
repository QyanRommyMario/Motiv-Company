# 🚀 Deployment Guide - GitHub + Supabase + Vercel

## ✅ Step 1: Push ke GitHub

### 1.1 Inisialisasi Git Repository
```bash
cd e:\Skripsi\motiv
git init
git add .
git commit -m "Initial commit: E-commerce platform with Next.js 16, Prisma, Midtrans"
```

### 1.2 Buat Repository di GitHub
1. Buka https://github.com/new
2. Nama repository: `motiv-ecommerce` (atau nama lain)
3. **Private** (recommended untuk production)
4. **JANGAN** centang "Add README" atau "Add .gitignore" (sudah ada)
5. Klik "Create repository"

### 1.3 Push ke GitHub
```bash
# Ganti <username> dengan GitHub username kamu
# Ganti <repository-name> dengan nama repo yang dibuat
git remote add origin https://github.com/<username>/<repository-name>.git
git branch -M main
git push -u origin main
```

---

## ✅ Step 2: Setup Supabase (Database Production)

### 2.1 Buat Project Supabase
1. Buka https://supabase.com
2. Sign in / Sign up (bisa pakai GitHub)
3. Klik "New Project"
4. Isi:
   - **Project name**: `motiv-ecommerce`
   - **Database Password**: (simpan password ini!)
   - **Region**: Singapore (Southeast Asia)
   - **Pricing Plan**: Free (500MB, sudah cukup untuk start)
5. Klik "Create new project"
6. Tunggu ~2 menit (setup database)

### 2.2 Get Connection String
1. Di dashboard Supabase, klik "Project Settings" (icon gear)
2. Klik "Database" di sidebar
3. Scroll ke "Connection string"
4. Pilih **"URI"** (bukan Session mode)
5. Copy connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```
6. **PENTING**: Ganti `[YOUR-PASSWORD]` dengan password yang kamu buat tadi!

### 2.3 Update .env.local
Buat file `.env.local` di root project:
```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Midtrans (Sandbox - ganti production nanti)
MIDTRANS_SERVER_KEY="your-sandbox-server-key"
MIDTRANS_CLIENT_KEY="your-sandbox-client-key"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Di Git Bash atau WSL
openssl rand -base64 32

# Atau di PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.4 Migrate Database
```bash
# Push schema Prisma ke Supabase
npx prisma db push

# Seed data (admin, products, etc)
npx prisma db seed

# Verify
npx prisma studio
```

---

## ✅ Step 3: Deploy ke Vercel

### 3.1 Connect GitHub to Vercel
1. Buka https://vercel.com
2. Sign up / Login dengan **GitHub account**
3. Klik "Add New..." → "Project"
4. Import repository `motiv-ecommerce`
5. Klik "Import"

### 3.2 Configure Build Settings
Vercel auto-detect Next.js, tapi pastikan:
- **Framework Preset**: Next.js
- **Root Directory**: ./
- **Build Command**: `next build`
- **Output Directory**: .next
- **Install Command**: `npm install`

### 3.3 Add Environment Variables di Vercel
Klik "Environment Variables", tambahkan SATU PER SATU:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | (dari Supabase - URI dengan pgbouncer) | Production, Preview, Development |
| `DIRECT_URL` | (dari Supabase - URI direct) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | (generate dengan openssl) | Production, Preview, Development |
| `NEXTAUTH_URL` | https://your-app.vercel.app | Production |
| `NEXTAUTH_URL` | https://your-app-preview.vercel.app | Preview |
| `NEXTAUTH_URL` | http://localhost:3000 | Development |
| `MIDTRANS_SERVER_KEY` | (dari Midtrans sandbox) | Production, Preview, Development |
| `MIDTRANS_CLIENT_KEY` | (dari Midtrans sandbox) | Production, Preview, Development |

**PENTING**: 
- Untuk `NEXTAUTH_URL` production, klik setelah deploy untuk update dengan URL actual Vercel
- Semua environment WAJIB diisi untuk Production & Preview

### 3.4 Deploy!
1. Klik "Deploy"
2. Tunggu 2-3 menit
3. ✅ DONE! App live di `https://your-app.vercel.app`

---

## 🔄 Alur Kerja Setelah Setup

### Setiap Code Changes:
```bash
# 1. Test local
npm run dev

# 2. Commit
git add .
git commit -m "feat: your feature description"

# 3. Push
git push

# 4. Vercel auto-deploy! ✨
```

### Update Database Schema:
```bash
# 1. Edit prisma/schema.prisma
# 2. Push changes
npx prisma db push

# 3. Generate client
npx prisma generate

# 4. Commit & push (Vercel akan auto-generate Prisma client)
git add .
git commit -m "chore: update database schema"
git push
```

---

## 🔍 Monitoring

### Database (Supabase):
- Dashboard: https://supabase.com/dashboard
- Table Editor: Lihat data real-time
- SQL Editor: Run custom queries
- Database size: Monitor di "Usage" tab

### Application (Vercel):
- Dashboard: https://vercel.com/dashboard
- Deployment logs: Setiap deploy ada log detail
- Analytics: Traffic, performance
- Function logs: Lihat error API routes

### Testing Production:
1. Buka `https://your-app.vercel.app`
2. Register B2C user
3. Test order flow
4. Check Supabase → Table Editor → Users, Orders, dll
5. Monitor Vercel → Functions → Logs

---

## 🆘 Troubleshooting

### Database Connection Error:
```bash
# Test connection
npx prisma db push

# Jika error:
# 1. Cek DATABASE_URL di Vercel environment variables
# 2. Pastikan password benar (no special chars yang perlu escape)
# 3. Cek Supabase project masih aktif (free tier unlimited selama ada aktivitas)
```

### Deploy Failed:
1. Check Vercel build logs
2. Pastikan semua env variables ada
3. Pastikan `npm run build` berhasil di local
4. Check Prisma schema valid: `npx prisma validate`

### NextAuth Session Error:
1. Pastikan `NEXTAUTH_SECRET` sama di semua environment
2. Pastikan `NEXTAUTH_URL` match dengan actual domain
3. Clear cookies & retry

---

## 📊 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **GitHub** | Free (Private repos unlimited) | Rp 0 |
| **Supabase** | Free (500MB DB, 2GB bandwidth) | Rp 0 |
| **Vercel** | Hobby (Unlimited for personal) | Rp 0 |
| **Domain** | (Optional - Vercel subdomain gratis) | Rp 0 |
| **Midtrans** | Sandbox (testing) | Rp 0 |
| **RajaOngkir** | (Nanti setelah launch) | Rp 75K/bulan |

**Total awal: Rp 0 / bulan** 🎉

Nanti upgrade:
- Supabase Pro (8GB DB): $25/month (~Rp 400K) - kalau traffic tinggi
- Vercel Pro (lebih banyak functions): $20/month (~Rp 320K) - optional
- Domain custom (.com): ~Rp 150K/tahun

---

## ✨ Next Steps After Deployment

1. **Test Production**:
   - Register test users (B2C & B2B)
   - Create test orders
   - Test payment flow (Midtrans sandbox)

2. **Setup Monitoring**:
   - Add Sentry (error tracking) - opsional
   - Setup Google Analytics - opsional
   - Configure Vercel Analytics

3. **Prepare for Production**:
   - Midtrans: Daftar merchant account (production)
   - RajaOngkir: Subscribe Pro plan
   - Custom domain (opsional)

4. **Security Checklist**:
   - [ ] All sensitive data di .env
   - [ ] HTTPS enabled (Vercel auto)
   - [ ] CORS configured
   - [ ] Rate limiting (future)
   - [ ] Input validation (sudah ada)

---

**🎯 Target Timeline:**
- ⏱️ Setup GitHub + Supabase: **30 menit**
- ⏱️ First deployment Vercel: **15 menit**
- ⏱️ Testing production: **30 menit**
- **Total: ~1-2 jam untuk full production setup!**

Good luck! 🚀
