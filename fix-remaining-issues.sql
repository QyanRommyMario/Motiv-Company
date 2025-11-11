-- ============================================
-- FIX REMAINING ISSUES
-- ============================================

-- 1. Fix Voucher - Set NULL quota to default value
UPDATE "Voucher" 
SET "quota" = 100 
WHERE "quota" IS NULL;

-- Make quota NOT NULL with default
ALTER TABLE "Voucher" 
ALTER COLUMN "quota" SET DEFAULT 100,
ALTER COLUMN "quota" SET NOT NULL;

-- Make used NOT NULL with default
UPDATE "Voucher" 
SET "used" = 0 
WHERE "used" IS NULL;

ALTER TABLE "Voucher" 
ALTER COLUMN "used" SET DEFAULT 0,
ALTER COLUMN "used" SET NOT NULL;

-- Make validFrom and validUntil NOT NULL (set default to current time if NULL)
UPDATE "Voucher" 
SET "validFrom" = CURRENT_TIMESTAMP 
WHERE "validFrom" IS NULL;

UPDATE "Voucher" 
SET "validUntil" = CURRENT_TIMESTAMP + INTERVAL '30 days' 
WHERE "validUntil" IS NULL;

ALTER TABLE "Voucher" 
ALTER COLUMN "validFrom" SET NOT NULL,
ALTER COLUMN "validUntil" SET NOT NULL;

-- 2. Fix Story - Add missing 'order' column
ALTER TABLE "Story" 
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Verify fixes
SELECT 'Voucher quota check:' as info, COUNT(*) as null_quota_count
FROM "Voucher" 
WHERE "quota" IS NULL;

SELECT 'Story has order column:' as info,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Story' AND column_name = 'order'
  ) as has_order;

SELECT 'ALL FIXES APPLIED' as status;
