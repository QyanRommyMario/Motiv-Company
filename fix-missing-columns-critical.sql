-- ============================================
-- FIX MISSING COLUMNS IN SUPABASE DATABASE
-- Based on Vercel error logs
-- ============================================

-- 1. Fix B2BRequest table - Add missing 'address' column
-- Error: The column `B2BRequest.address` does not exist
ALTER TABLE "B2BRequest" 
ADD COLUMN IF NOT EXISTS "address" TEXT;

-- 2. Fix Voucher table - Add missing 'quota' column
-- Error: The column `Voucher.quota` does not exist
ALTER TABLE "Voucher" 
ADD COLUMN IF NOT EXISTS "quota" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS "used" INTEGER NOT NULL DEFAULT 0;

-- 3. Verify all B2BRequest columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'B2BRequest'
ORDER BY ordinal_position;

-- 4. Verify all Voucher columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;

-- ============================================
-- Expected B2BRequest columns:
-- - id, userId, businessName, phone, address, 
--   status, createdAt, updatedAt
-- ============================================

-- ============================================
-- Expected Voucher columns:
-- - id, code, type, value, minPurchase, maxDiscount,
--   quota, used, validFrom, validUntil, isActive, createdAt
-- ============================================
