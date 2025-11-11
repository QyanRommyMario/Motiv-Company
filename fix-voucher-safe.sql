-- ============================================
-- FIX VOUCHER TABLE - ONLY MISSING RENAMES
-- Skip 'quota' and 'used' (already exist)
-- ============================================

-- Check which columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;

-- Only rename columns that still have old names
-- (Skip if already renamed)

-- Rename usageCount to used (if usageCount still exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Voucher' AND column_name = 'usageCount'
  ) THEN
    ALTER TABLE "Voucher" RENAME COLUMN "usageCount" TO "used";
  END IF;
END $$;

-- Rename startDate to validFrom (if startDate still exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Voucher' AND column_name = 'startDate'
  ) THEN
    ALTER TABLE "Voucher" RENAME COLUMN "startDate" TO "validFrom";
  END IF;
END $$;

-- Rename endDate to validUntil (if endDate still exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Voucher' AND column_name = 'endDate'
  ) THEN
    ALTER TABLE "Voucher" RENAME COLUMN "endDate" TO "validUntil";
  END IF;
END $$;

-- Drop description column if exists
ALTER TABLE "Voucher" 
DROP COLUMN IF EXISTS "description";

-- Drop updatedAt column if exists  
ALTER TABLE "Voucher" 
DROP COLUMN IF EXISTS "updatedAt";

-- Verify final columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;
