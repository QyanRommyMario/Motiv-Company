# 🔧 Authentication Error Fix

## ❌ Problem

Error saat login/register: "Internal Server Error" di `/api/auth/error`

## 🔍 Root Causes Found

### 1. **Database Connection Issue** (CRITICAL)

- ❌ Password di `.env` salah: `password`
- ✅ Harus gunakan password PostgreSQL yang benar

### 2. **Port Mismatch** (MINOR)

- `.env` menggunakan port **3000**
- Tapi server jalan di port **3001**

---

## 🚀 Solution Steps

### Step 1: Fix Database Password

**Cari password PostgreSQL Anda:**

Buka **pgAdmin 4**, connect ke server dengan password yang Anda buat saat install PostgreSQL.

**Update `.env`:**

```bash
# Ganti 'password' dengan password PostgreSQL Anda
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/motiv_coffee?schema=public"
```

**Contoh:**

```bash
# Jika password PostgreSQL Anda: admin123
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/motiv_coffee?schema=public"
```

### Step 2: Fix Port Configuration

Update di `.env`:

```bash
# Dari ini:
NEXTAUTH_URL="http://localhost:3000"

# Ke ini:
NEXTAUTH_URL="http://localhost:3001"
```

### Step 3: Push Database Schema

Setelah password benar, jalankan:

```powershell
cd e:\Skripsi\motiv
npx prisma db push
```

Output yang benar:

```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema.
```

### Step 4: Seed Database

```powershell
node prisma/seed.js
```

Output:

```
🌱 Seeding database...
✅ Users created
✅ Products created
✅ Seed complete
```

### Step 5: Restart Development Server

```powershell
# Kill any existing process
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start fresh
npm run dev
```

### Step 6: Test Login

Buka browser: **http://localhost:3001/login**

**Test Credentials:**

- 👤 Admin: `admin@motiv.com` / `admin123`
- 👤 User B2C: `user@test.com` / `user123`
- 👤 User B2B: `b2b@test.com` / `b2b123`

---

## 🔍 Quick Diagnosis

**Check PostgreSQL Running:**

```powershell
Get-Service postgresql*
# Should show: Status = Running
```

**Test Database Connection:**

```powershell
psql -U postgres -d motiv_coffee
# Masukkan password PostgreSQL
# Jika berhasil connect, database OK
# Keluar: \q
```

**Check if Database Exists:**

```powershell
psql -U postgres -c "\l" | Select-String "motiv_coffee"
# Should show: motiv_coffee | postgres
```

---

## 🆘 If Still Error

### Kemungkinan 1: Database Belum Dibuat

```powershell
# Login PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE motiv_coffee;

# Exit
\q
```

### Kemungkinan 2: Password PostgreSQL Lupa

**Reset password:**

1. Buka `C:\Program Files\PostgreSQL\17\data\pg_hba.conf` (atau versi Anda)
2. Cari baris: `host all all 127.0.0.1/32 scram-sha-256`
3. Ganti ke: `host all all 127.0.0.1/32 trust`
4. Restart PostgreSQL service:
   ```powershell
   Restart-Service postgresql-x64-17
   ```
5. Login tanpa password:
   ```powershell
   psql -U postgres
   ```
6. Reset password:
   ```sql
   ALTER USER postgres PASSWORD 'password_baru_anda';
   ```
7. Kembalikan `pg_hba.conf` ke `scram-sha-256`
8. Restart service lagi

### Kemungkinan 3: Port 5432 Terpakai

```powershell
# Check port
netstat -ano | findstr :5432

# Jika ada process lain, kill:
Stop-Process -Id PID_NUMBER -Force
```

---

## ✅ Expected Result

Setelah fix:

1. **Database Connected** ✓

   ```
   Prisma Client generated
   Database synchronized
   ```

2. **Server Running** ✓

   ```
   ▲ Next.js 16.0.0
   - Local: http://localhost:3001
   ✓ Ready in 3.2s
   ```

3. **Login Success** ✓
   - No redirect to error page
   - Dashboard shows user info
   - Role-based features working

---

## 📝 Quick Command Reference

```powershell
# 1. Update .env (manual - gunakan editor)

# 2. Push schema
npx prisma db push

# 3. Seed data
node prisma/seed.js

# 4. Generate Prisma Client
npx prisma generate

# 5. Start server
npm run dev

# 6. Test login
# Buka: http://localhost:3001/login
```

---

## 🎯 Next Steps After Fix

1. ✅ Login dengan 3 role berbeda (Admin, B2C, B2B)
2. ✅ Test Admin panel: `http://localhost:3001/admin`
3. ✅ Test B2B discount (should see 10% off)
4. ✅ Test shopping flow (cart → checkout → payment)
5. ✅ Continue CSS modernization (remaining 50%)

---

**Need Help?** Check error messages di terminal dan share screenshot! 🚀
