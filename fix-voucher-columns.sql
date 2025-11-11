-- ============================================
-- FIX VOUCHER TABLE - RENAME COLUMNS
-- Match database to Prisma schema
-- ============================================

-- Voucher: Rename columns to match Prisma
ALTER TABLE "Voucher" 
RENAME COLUMN "usageLimit" TO "quota";

ALTER TABLE "Voucher" 
RENAME COLUMN "usageCount" TO "used";

ALTER TABLE "Voucher" 
RENAME COLUMN "startDate" TO "validFrom";

ALTER TABLE "Voucher" 
RENAME COLUMN "endDate" TO "validUntil";

-- Drop columns that don't exist in Prisma schema
ALTER TABLE "Voucher" 
DROP COLUMN IF EXISTS "description",
DROP COLUMN IF EXISTS "updatedAt";

-- Verify Voucher columns after changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;

-- ============================================
-- Expected result after rename:
-- id, code, type, value, minPurchase, maxDiscount,
-- quota, used, validFrom, validUntil, isActive, createdAt
-- ============================================
