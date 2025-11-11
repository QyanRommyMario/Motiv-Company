-- ============================================
-- CREATE MISSING TABLES IN SUPABASE
-- Run this ONLY if tables don't exist
-- ============================================

-- Create Voucher table if not exists
CREATE TABLE IF NOT EXISTS "Voucher" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "code" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL, -- PERCENTAGE, FIXED
  "value" DOUBLE PRECISION NOT NULL,
  "minPurchase" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "maxDiscount" DOUBLE PRECISION,
  "quota" INTEGER NOT NULL,
  "used" INTEGER NOT NULL DEFAULT 0,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verify Voucher table created
SELECT 'Voucher table created' as status;

-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
