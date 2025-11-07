# 🐘 PostgreSQL Setup Guide

## ✅ Schema Updated to PostgreSQL!

Prisma schema sudah diupdate dari MongoDB ke PostgreSQL dengan perubahan:

- ✅ `provider = "postgresql"`
- ✅ UUID sebagai ID (dari ObjectId)
- ✅ Foreign key relations

---

## 🚀 Setup PostgreSQL

### Option 1: Local PostgreSQL (Recommended for Development)

#### Windows:

**1. Download PostgreSQL**

- https://www.postgresql.org/download/windows/
- Download PostgreSQL installer (versi terbaru)

**2. Install PostgreSQL**

- Run installer
- Set password untuk user `postgres` (INGAT PASSWORD INI!)
- Port: 5432 (default)
- Locale: Default
- Install pgAdmin 4 ✅ (GUI tool)

**3. Verify Installation**

```powershell
# Check PostgreSQL service
Get-Service postgresql*

# Should show "Running"
```

**4. Create Database**

**Via pgAdmin:**

1. Buka pgAdmin 4
2. Connect ke server (password yang tadi dibuat)
3. Right-click "Databases" → Create → Database
4. Name: `motiv_coffee`
5. Save

**Via Command Line:**

```powershell
# Login ke PostgreSQL
psql -U postgres

# Masukkan password

# Create database
CREATE DATABASE motiv_coffee;

# Verify
\l

# Exit
\q
```

**5. Update .env**

```bash
# Ganti 'password' dengan password postgres Anda
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/motiv_coffee?schema=public"
```

---

### Option 2: Docker PostgreSQL

```bash
# Pull & Run PostgreSQL
docker run -d \
  --name postgres-motiv \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=motiv_coffee \
  -p 5432:5432 \
  postgres:16-alpine

# Check if running
docker ps

# View logs
docker logs postgres-motiv

# .env configuration:
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/motiv_coffee?schema=public"
```

---

### Option 3: Supabase (Cloud PostgreSQL - Free Tier)

**1. Create Account**

- https://supabase.com
- Sign up gratis

**2. Create Project**

- Project name: `motiv-coffee`
- Database password: (generate atau buat sendiri - SIMPAN!)
- Region: Singapore/Jakarta

**3. Get Connection String**

- Go to Project Settings → Database
- Copy "Connection string" → "URI"
- Contoh:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**4. Update .env**

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

---

## 📦 Run Migrations

Setelah PostgreSQL running dan .env diupdate:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create migrations & push to database
npx prisma migrate dev --name init

# 3. Seed database dengan test data
npm run seed
```

---

## 🧪 Test Connection

```bash
# Test database connection
npx prisma db push

# Jika success, akan muncul:
# ✔ Database synchronized with Prisma schema
```

---

## 🔧 Common Issues

### Error: Authentication failed

```
Error: P1000: Authentication failed against database server
```

**Solutions:**

1. Check password di .env correct
2. Verify PostgreSQL service running
3. Test login via pgAdmin atau psql

### Error: Database does not exist

```
Error: P1003: Database motiv_coffee does not exist
```

**Solution:**

```sql
-- Create database via psql
CREATE DATABASE motiv_coffee;
```

### Error: Connection refused

```
Error: Can't reach database server at localhost:5432
```

**Solutions:**

1. PostgreSQL service tidak running

```powershell
# Start service
net start postgresql-x64-16
```

2. Port salah - check postgresql.conf
3. Firewall blocking port 5432

---

## 📝 Default Credentials

Jika menggunakan setup default:

```bash
# Local PostgreSQL
User: postgres
Password: (yang Anda set saat install)
Database: motiv_coffee
Port: 5432

# Docker PostgreSQL
User: postgres
Password: postgres123
Database: motiv_coffee
Port: 5432
```

---

## 🎯 Next Steps

1. **Setup PostgreSQL** (pilih Option 1, 2, atau 3)
2. **Update .env** dengan credentials yang benar
3. **Run migrations**: `npx prisma migrate dev --name init`
4. **Seed database**: `npm run seed`
5. **Start server**: `npm run dev`
6. **Test aplikasi**: http://localhost:3000

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed/running
- [ ] Database `motiv_coffee` created
- [ ] .env updated dengan connection string
- [ ] Prisma Client generated
- [ ] Migrations executed successfully
- [ ] Database seeded with test data
- [ ] Server starts without database errors

---

## 🔍 Useful Commands

```bash
# Check PostgreSQL version
psql --version

# Connect to database
psql -U postgres -d motiv_coffee

# List all databases
psql -U postgres -l

# View Prisma Studio (Database GUI)
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset

# View database in browser
npx prisma studio
# Opens: http://localhost:5555
```

---

## 📊 Database Schema

Total 7 tables akan dibuat:

1. **User** - User accounts (B2C, B2B, Admin)
2. **Product** - Coffee products
3. **ProductVariant** - Product variants (sizes, grind types)
4. **CartItem** - Shopping cart items
5. **Order** - Customer orders
6. **OrderItem** - Order details
7. **Voucher** - Discount vouchers
8. **B2BRequest** - B2B registration requests

---

## 🎉 Ready!

Setelah setup selesai, aplikasi akan:

- ✅ Connect ke PostgreSQL
- ✅ Auto-create tables via Prisma
- ✅ Seed test data (products, users, vouchers)
- ✅ Ready untuk testing!
