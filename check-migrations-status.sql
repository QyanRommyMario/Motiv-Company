-- ============================================
-- CHECK MIGRATION STATUS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if migrations table exists and what migrations have been applied
SELECT migration_name, finished_at, applied_steps_count 
FROM _prisma_migrations 
ORDER BY finished_at DESC 
LIMIT 10;

-- 2. If _prisma_migrations doesn't exist, create it manually
-- This means NO migrations have been run on this database
-- CREATE TABLE _prisma_migrations (
--   id VARCHAR(36) PRIMARY KEY,
--   checksum VARCHAR(64) NOT NULL,
--   finished_at TIMESTAMP(3),
--   migration_name VARCHAR(255) NOT NULL,
--   logs TEXT,
--   rolled_back_at TIMESTAMP(3),
--   started_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   applied_steps_count INTEGER NOT NULL DEFAULT 0
-- );
