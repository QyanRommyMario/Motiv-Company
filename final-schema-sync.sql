-- ============================================
-- FINAL SCHEMA SYNC - SAFE VERSION
-- Check first, then apply only what's missing
-- ============================================

-- 1. ProductVariant - Rename 'size' to 'name' (if size exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ProductVariant' AND column_name = 'size'
  ) THEN
    ALTER TABLE "ProductVariant" RENAME COLUMN "size" TO "name";
  END IF;
END $$;

-- 2. Order - Add shipping columns (if not exist)
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

-- 3. Product - Add features column (if not exist)
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 4. ShippingAddress - Add country column (if not exist)
ALTER TABLE "ShippingAddress" 
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Indonesia';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check ProductVariant has 'name'
SELECT 'ProductVariant has name column:' as check_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ProductVariant' AND column_name = 'name'
  ) as has_name;

-- Check Order shipping columns count
SELECT 'Order shipping columns count:' as check_result,
  COUNT(*) as shipping_cols
FROM information_schema.columns 
WHERE table_name = 'Order' 
  AND column_name LIKE '%shipping%';

-- Check Product has features
SELECT 'Product has features column:' as check_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Product' AND column_name = 'features'
  ) as has_features;

-- Check ShippingAddress has country
SELECT 'ShippingAddress has country column:' as check_result,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ShippingAddress' AND column_name = 'country'
  ) as has_country;

-- Summary of all fixes
SELECT 'SCHEMA SYNC COMPLETE' as status;
