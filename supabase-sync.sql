-- ============================================
-- SUPABASE PRODUCTION DATABASE - SYNC (SAFE)
-- ✅ Only ADD/RENAME missing columns, NO DATA LOSS
-- Complete schema alignment with development
-- Generated: 2025-11-11
-- ============================================

-- ============================================
-- ProductVariant Table - Rename 'size' to 'name'
-- ============================================
ALTER TABLE "ProductVariant" 
RENAME COLUMN "size" TO "name";

-- ============================================
-- Order Table - Add missing shipping columns
-- ============================================
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
ADD COLUMN IF NOT EXISTS "customShippingNote" TEXT,
ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;

-- ============================================
-- Product Table - Add missing features column
-- ============================================
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ============================================
-- ShippingAddress Table - Add missing country column
-- ============================================
ALTER TABLE "ShippingAddress" 
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Indonesia';

-- ============================================
-- VERIFICATION - Check if all columns exist
-- ============================================

-- Check ProductVariant table (should have 'name' column)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'ProductVariant';

-- Check Order table columns
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'Order' 
-- ORDER BY ordinal_position;

-- Check Product table columns
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'Product';

-- Check Story table (should have featuredImage)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'Story';

-- ============================================
-- NOTES:
-- ============================================
-- ✅ No data deleted - all existing data preserved
-- ✅ ProductVariant.size renamed to name (to match Prisma)
-- ✅ Only missing columns added
-- ✅ Story table already correct (featuredImage exists)
-- ✅ User table already correct (no changes needed)
-- ============================================

-- After running this SQL:
-- 1. All tables will match development schema
-- 2. Existing data remains intact
-- 3. ProductVariant will use 'name' column
-- 4. Ready to redeploy Vercel
-- ============================================
