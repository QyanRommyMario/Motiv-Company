-- ============================================
-- Supabase Schema Sync Script
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check existing Order table structure
-- Run this first to see what columns exist:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Order';

-- 2. Add missing columns to Order table (if not exist)
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "shippingName" TEXT,
ADD COLUMN IF NOT EXISTS "shippingPhone" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT,
ADD COLUMN IF NOT EXISTS "shippingCity" TEXT,
ADD COLUMN IF NOT EXISTS "shippingProvince" TEXT,
ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT DEFAULT 'Indonesia',
ADD COLUMN IF NOT EXISTS "shippingPostalCode" TEXT,
ADD COLUMN IF NOT EXISTS "courierName" TEXT,
ADD COLUMN IF NOT EXISTS "courierService" TEXT,
ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
ADD COLUMN IF NOT EXISTS "isCustomShipping" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "customShippingNote" TEXT;

-- 3. Check Story table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Story';

-- 4. Story table: Keep featuredImage OR rename to imageUrl (choose one)
-- Option A: Rename featuredImage to imageUrl (if you want to match schema.prisma)
-- ALTER TABLE "Story" RENAME COLUMN "featuredImage" TO "imageUrl";

-- Option B: Keep featuredImage and update schema.prisma instead
-- (No SQL needed, just update prisma/schema.prisma later)

-- 5. Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 6. Check for any NULL values that might cause issues
SELECT 
  (SELECT COUNT(*) FROM "Order" WHERE "shippingName" IS NULL) as orders_without_shipping_name,
  (SELECT COUNT(*) FROM "Story") as total_stories;
