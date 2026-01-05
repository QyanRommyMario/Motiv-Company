-- ========================================
-- FIX SUPABASE DELETE PRODUCT ISSUE
-- ========================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Created: January 5, 2026
-- Issue: Product deletion fails due to foreign key constraints

-- ========================================
-- ISSUE EXPLANATION
-- ========================================
-- The OrderItem table has ON DELETE RESTRICT for productId
-- This means products cannot be deleted if they exist in any order
-- Solution: Change to ON DELETE SET NULL or implement soft delete

-- ========================================
-- SOLUTION 1: ALTER FOREIGN KEY TO CASCADE (RECOMMENDED FOR CART)
-- ========================================
-- This will automatically delete related CartItems when product is deleted

-- Drop existing CartItem foreign key constraints
ALTER TABLE "CartItem" 
  DROP CONSTRAINT IF EXISTS "CartItem_productId_fkey";

-- Recreate with CASCADE
ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_productId_fkey" 
  FOREIGN KEY ("productId") 
  REFERENCES "Product"(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- ========================================
-- SOLUTION 2: MAKE OrderItem productId NULLABLE (RECOMMENDED FOR ORDERS)
-- ========================================
-- This preserves order history even if product is deleted
-- We'll store product name in OrderItem to keep historical data

-- First, add a column to store product name for historical record
ALTER TABLE "OrderItem" 
  ADD COLUMN IF NOT EXISTS "productName" TEXT;

-- Update existing records to store current product names
UPDATE "OrderItem" oi
SET "productName" = p.name
FROM "Product" p
WHERE oi."productId" = p.id
AND oi."productName" IS NULL;

-- Drop the old constraint
ALTER TABLE "OrderItem" 
  DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";

-- Make productId nullable
ALTER TABLE "OrderItem" 
  ALTER COLUMN "productId" DROP NOT NULL;

-- Recreate foreign key with SET NULL on delete
ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_productId_fkey" 
  FOREIGN KEY ("productId") 
  REFERENCES "Product"(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Also update variantId to be nullable
ALTER TABLE "OrderItem" 
  DROP CONSTRAINT IF EXISTS "OrderItem_variantId_fkey";

ALTER TABLE "OrderItem" 
  ALTER COLUMN "variantId" DROP NOT NULL;

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_variantId_fkey" 
  FOREIGN KEY ("variantId") 
  REFERENCES "ProductVariant"(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Add variant name column for historical data
ALTER TABLE "OrderItem" 
  ADD COLUMN IF NOT EXISTS "variantName" TEXT;

-- Update existing records
UPDATE "OrderItem" oi
SET "variantName" = pv.name
FROM "ProductVariant" pv
WHERE oi."variantId" = pv.id
AND oi."variantName" IS NULL;

-- ========================================
-- SOLUTION 3: ENABLE ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================
-- If the issue is permission-related, ensure proper RLS policies

-- Enable RLS on Product table
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "product_select_policy" ON "Product";
DROP POLICY IF EXISTS "product_insert_policy" ON "Product";
DROP POLICY IF EXISTS "product_update_policy" ON "Product";
DROP POLICY IF EXISTS "product_delete_policy" ON "Product";

-- Allow public read access (for browsing products)
CREATE POLICY "product_select_policy" 
  ON "Product" FOR SELECT 
  USING (true);

-- Allow admin to insert products
CREATE POLICY "product_insert_policy" 
  ON "Product" FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM "User" WHERE role = 'ADMIN'
    )
  );

-- Allow admin to update products
CREATE POLICY "product_update_policy" 
  ON "Product" FOR UPDATE 
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM "User" WHERE role = 'ADMIN'
    )
  );

-- Allow admin to delete products
CREATE POLICY "product_delete_policy" 
  ON "Product" FOR DELETE 
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM "User" WHERE role = 'ADMIN'
    )
  );

-- ========================================
-- SOLUTION 4: DISABLE RLS FOR SERVER-SIDE OPERATIONS (ALTERNATIVE)
-- ========================================
-- If you're using service_role key or server-side operations, 
-- RLS might not apply. In that case, disable it:

-- ALTER TABLE "Product" DISABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- 1. Check current foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'OrderItem' OR tc.table_name = 'CartItem')
  AND ccu.table_name = 'Product';

-- 2. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'Product';

-- 3. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'Product';

-- 4. Test which products have orders (these would fail without the fix)
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT oi."orderId") as order_count,
  COUNT(DISTINCT ci.id) as cart_count
FROM "Product" p
LEFT JOIN "OrderItem" oi ON oi."productId" = p.id
LEFT JOIN "CartItem" ci ON ci."productId" = p.id
GROUP BY p.id, p.name
HAVING COUNT(DISTINCT oi."orderId") > 0 OR COUNT(DISTINCT ci.id) > 0
ORDER BY order_count DESC;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- After running these queries:
-- 
-- 1. Products can be safely deleted
-- 2. Cart items will be automatically removed
-- 3. Order history is preserved with product names
-- 4. RLS policies are properly configured
--
-- Test by trying to delete a product from admin panel!
-- ========================================
