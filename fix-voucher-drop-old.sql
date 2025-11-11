-- ============================================
-- FIX VOUCHER - DROP OLD COLUMNS, KEEP NEW ONES
-- ============================================

-- Drop old columns that are duplicates
ALTER TABLE "Voucher" 
DROP COLUMN IF EXISTS "usageLimit",
DROP COLUMN IF EXISTS "usageCount",
DROP COLUMN IF EXISTS "startDate",
DROP COLUMN IF EXISTS "endDate",
DROP COLUMN IF EXISTS "description",
DROP COLUMN IF EXISTS "updatedAt";

-- Verify final Voucher columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;

-- Expected columns after cleanup:
-- id, code, type, value, minPurchase, maxDiscount,
-- isActive, createdAt, quota, used, validFrom, validUntil
