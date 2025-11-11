# 🔍 Database Schema Diff Analysis

## ❌ Problem Detected:
Production database (Supabase) **OUT OF SYNC** with Prisma schema.

Error: `Column Order.shippingName does not exist in the current database`

---

## 🎯 Root Cause:

**Kemungkinan 1:** Migrations belum pernah dijalankan di Supabase
- Table dibuat manual di Supabase
- Prisma migrations folder tidak pernah di-apply

**Kemungkinan 2:** Database di-reset/import dari backup lama
- Migrations history hilang
- Schema kembali ke versi lama

---

## 📋 Missing Columns in Production:

### Order Table (11 columns missing):
- ✅ `shippingName` TEXT
- ✅ `shippingPhone` TEXT
- ✅ `shippingAddress` TEXT
- ✅ `shippingCity` TEXT
- ✅ `shippingProvince` TEXT
- ✅ `shippingCountry` TEXT DEFAULT 'Indonesia'
- ✅ `shippingPostalCode` TEXT
- ✅ `courierName` TEXT
- ✅ `courierService` TEXT
- ✅ `shippingCost` FLOAT
- ✅ `trackingNumber` TEXT (nullable)
- ✅ `isCustomShipping` BOOLEAN DEFAULT false
- ✅ `customShippingNote` TEXT (nullable)

### Story Table (column name mismatch):
- Database has: `featuredImage`
- Schema expects: `imageUrl`

**Decision needed:** Rename column OR update schema.prisma?

---

## 🚀 Action Plan (Step by Step):

### Step 1: Check Migration Status in Supabase
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/aaltkprawfanoajoevcp/sql
2. Run SQL from: `check-migrations-status.sql`
3. See if `_prisma_migrations` table exists
4. Check which migrations have been applied

### Step 2: Apply Missing Schema Changes
**Option A: Run SQL Script (SAFE - RECOMMENDED)**
1. Open: `supabase-schema-sync.sql`
2. Copy SQL script
3. Run in Supabase SQL Editor
4. Verify with: `SELECT * FROM "Order" LIMIT 1;`

**Option B: Use Prisma DB Push (RISKY)**
```bash
# This will force sync schema to production
npx prisma db push --accept-data-loss
```
⚠️ WARNING: Can cause data loss if schema conflicts!

### Step 3: Fix Story Table Column
**Choose ONE:**

**Option A: Rename in Database (match schema.prisma)**
```sql
ALTER TABLE "Story" RENAME COLUMN "featuredImage" TO "imageUrl";
```

**Option B: Update schema.prisma (match database)**
```prisma
model Story {
  featuredImage String? // Change from imageUrl
}
```
Then regenerate Prisma client:
```bash
npx prisma generate
git add -A
git commit -m "fix: update Story schema to match database column"
git push
```

### Step 4: Redeploy Vercel
After schema is fixed:
1. Go to: https://vercel.com/rommymario01-1763s-projects/motivcompany
2. Click **Redeploy** (automatically uses latest commit)
3. Wait ~2-3 minutes

### Step 5: Test Production
1. Login: https://motivcompany.vercel.app/admin
2. Try all admin features:
   - ✅ Dashboard stats
   - ✅ Products list
   - ✅ Orders list
   - ✅ Stories list
   - ✅ Upload image

---

## 📊 Recommendation:

**RECOMMENDED PATH:**

1. ✅ Run `check-migrations-status.sql` in Supabase (SEE STATUS)
2. ✅ Run `supabase-schema-sync.sql` in Supabase (ADD COLUMNS)
3. ✅ Update `schema.prisma`: rename `imageUrl` → `featuredImage` (MATCH DB)
4. ✅ `npx prisma generate` (LOCAL)
5. ✅ Commit & push to GitHub
6. ✅ Redeploy Vercel
7. ✅ Test production

**Time Estimate:** 10-15 minutes

---

## 🔧 Files Created:

1. `check-migrations-status.sql` - Check migration history
2. `supabase-schema-sync.sql` - Add missing columns
3. `DATABASE_SYNC_GUIDE.md` - This file

---

## ⚠️ Safety Notes:

- ✅ SQL uses `ADD COLUMN IF NOT EXISTS` (safe, won't error if exists)
- ✅ No data will be deleted
- ✅ Existing data preserved
- ⚠️ New Order records need shipping info filled

---

**Ready to proceed?** 
Start with **Step 1** → Run `check-migrations-status.sql` in Supabase!
