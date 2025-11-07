# ⚡ Quick Reference - PostgreSQL Setup

## 🎯 TL;DR (30 detik setup)

```powershell
# 1. Set password (bisa skip jika sudah tahu password)
psql -U postgres
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE motiv_coffee;
\q

# 2. Update .env (ganti password jika beda)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/motiv_coffee?schema=public"

# 3. Migrate & Seed
npx prisma migrate dev --name init
npm run seed

# 4. Start
npm run dev
```

---

## ✅ What's Fixed

1. **✅ Middleware → Proxy**

   - File: `src/proxy.js` (baru)
   - Removed: `src/middleware.js` (lama)
   - No more deprecation warning!

2. **✅ Schema: PostgreSQL**
   - Changed from MongoDB to PostgreSQL
   - UUID-based IDs
   - Ready for Supabase migration

---

## 🔑 Your PostgreSQL Password

**Current .env:**

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/motiv_coffee?schema=public"
```

**Ganti `password` dengan password postgres Anda!**

### Don't know password?

```powershell
# Option 1: Use pgAdmin 4
# Open pgAdmin → Connect with saved password

# Option 2: Reset via trust method
# Edit C:\Program Files\PostgreSQL\17\data\pg_hba.conf
# Change "scram-sha-256" to "trust"
# Restart: net stop postgresql-x64-17 && net start postgresql-x64-17
# Set password: psql -U postgres
# ALTER USER postgres PASSWORD 'newpass';
```

---

## 🚀 Once Database is Ready

```bash
# Test connection
npx prisma db push

# Should see: "Database synchronized with Prisma schema"

# If success, seed data:
npm run seed

# Start dev server:
npm run dev
```

---

## 📊 Test Data (After Seed)

| User Type | Email             | Password    |
| --------- | ----------------- | ----------- |
| Customer  | customer@test.com | password123 |
| B2B       | b2b@test.com      | password123 |
| Admin     | admin@test.com    | password123 |

**Products:** 5 coffee products with variants  
**Vouchers:** WELCOME10, B2B20, NEWUSER

---

## 🔍 Check Status

```powershell
# PostgreSQL running?
Get-Service postgresql*

# Database exists?
psql -U postgres -l | findstr motiv

# Tables created?
psql -U postgres -d motiv_coffee
\dt
\q
```

---

## 🎯 Ready to Code!

Once `npm run dev` runs without errors:

- Homepage: http://localhost:3000
- Login: http://localhost:3000/login
- Products: http://localhost:3000/products
- Cart: http://localhost:3000/cart

---

## 📖 More Help

- Full PostgreSQL setup: `POSTGRESQL_SETUP.md`
- Testing guide: `TESTING_REPORT.md`
- Original quickstart: `QUICKSTART.md`
