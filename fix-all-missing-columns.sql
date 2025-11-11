-- ============================================
-- FIX ALL MISSING COLUMNS IN SUPABASE
-- Based on Vercel runtime errors
-- ============================================

-- 1. FIX B2BRequest table - add missing columns
ALTER TABLE "B2BRequest" 
ADD COLUMN IF NOT EXISTS "businessName" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "address" TEXT;

-- 2. FIX Voucher table - add missing columns
ALTER TABLE "Voucher" 
ADD COLUMN IF NOT EXISTS "code" TEXT,
ADD COLUMN IF NOT EXISTS "type" TEXT,
ADD COLUMN IF NOT EXISTS "value" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "minPurchase" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "maxDiscount" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "quota" INTEGER,
ADD COLUMN IF NOT EXISTS "used" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "validFrom" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "validUntil" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Add unique constraint to Voucher.code if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Voucher_code_key'
    ) THEN
        ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_code_key" UNIQUE ("code");
    END IF;
END $$;

-- 3. ProductVariant - RENAME size to name (already done before)
-- ALTER TABLE "ProductVariant" RENAME COLUMN "size" TO "name";

-- 4. Order table - add shipping columns (already done before)
-- (Skip if already added)

-- 5. Product table - add features (already done before)
-- (Skip if already added)

-- 6. ShippingAddress - add country (already done before)
-- (Skip if already added)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check B2BRequest columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'B2BRequest'
ORDER BY ordinal_position;

-- Check Voucher columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Voucher'
ORDER BY ordinal_position;

-- Check ProductVariant has 'name' column
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ProductVariant' 
  AND column_name IN ('name', 'size');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'All missing columns added successfully!' as status;
