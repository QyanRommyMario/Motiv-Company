-- ============================================
-- PRODUCTION DATABASE SYNC SCRIPT
-- Generated from Prisma schema.prisma
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Fix Order table - Add missing shipping columns
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "shippingName" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS "shippingPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "shippingCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "shippingProvince" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT NOT NULL DEFAULT 'Indonesia',
ADD COLUMN IF NOT EXISTS "shippingPostalCode" TEXT NOT NULL DEFAULT '';

-- Fix Order table - Add missing courier columns
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "courierName" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "courierService" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Fix Order table - Add missing optional columns
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
ADD COLUMN IF NOT EXISTS "isCustomShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "customShippingNote" TEXT;

-- Fix Order table - Add missing timestamp columns
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. All new columns use DEFAULT values to avoid NULL errors
-- 2. Existing Order records will get default values
-- 3. Future orders should provide actual shipping info
-- 4. Story table already has correct "featuredImage" column
-- ============================================

-- Verification Query - Run after to check
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'Order' 
-- ORDER BY ordinal_position;
