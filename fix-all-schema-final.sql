-- ============================================
-- FIX ALL SCHEMA MISMATCHES - FINAL
-- ============================================

-- 1. FIX VOUCHER TABLE
-- Rename columns to match Prisma schema
ALTER TABLE "Voucher" 
RENAME COLUMN "usageLimit" TO "quota";

ALTER TABLE "Voucher" 
RENAME COLUMN "usageCount" TO "used";

ALTER TABLE "Voucher" 
RENAME COLUMN "startDate" TO "validFrom";

ALTER TABLE "Voucher" 
RENAME COLUMN "endDate" TO "validUntil";

-- Drop extra columns not in Prisma
ALTER TABLE "Voucher" 
DROP COLUMN IF EXISTS "description",
DROP COLUMN IF EXISTS "updatedAt";

-- 2. FIX B2BREQUEST TABLE
-- Ensure 'address' column exists (already added before)
-- Database has 'businessAddress' but Prisma uses 'address'
-- Both should exist for backward compatibility

-- Verify final schema
SELECT 'Voucher columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;

SELECT 'B2BRequest columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'B2BRequest'
ORDER BY ordinal_position;

-- ============================================
-- After running this:
-- 1. Voucher will have: quota, used, validFrom, validUntil
-- 2. B2BRequest will have: address (and businessAddress for old data)
-- 3. Ready for Vercel redeploy
-- ============================================
