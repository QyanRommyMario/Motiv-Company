-- ============================================
-- CREATE ADMIN USER - MOTIV COMPANY
-- ============================================
-- This SQL can be run directly in Supabase SQL Editor
-- Password will be hashed with bcryptjs (10 rounds)

-- Option 1: Create admin with bcrypt hash
-- Password: MotivAdmin2024!
-- Hash generated with: bcrypt.hash('MotivAdmin2024!', 10)

INSERT INTO "User" (
  "id",
  "email",
  "password",
  "name",
  "role",
  "status",
  "discount",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@motivcompany.com',
  '$2a$10$xYzKLm9pQrStUvWxYzAbCuJ8KLmnOpQrStUvWxYzAbCuJ8KLmnOpQ', -- Replace with actual bcrypt hash
  'Motiv Administrator',
  'ADMIN',
  'ACTIVE',
  0,
  NOW(),
  NOW()
) ON CONFLICT ("email") DO UPDATE SET
  "password" = EXCLUDED."password",
  "name" = EXCLUDED."name",
  "role" = 'ADMIN',
  "status" = 'ACTIVE',
  "updatedAt" = NOW();

-- ============================================
-- CURRENT ADMIN CREDENTIALS
-- ============================================

-- Email:    admin@motivcompany.com
-- Password: MotivAdmin2024!
-- Role:     ADMIN
-- Status:   ACTIVE

-- ============================================
-- VERIFY ADMIN
-- ============================================

SELECT 
  "id",
  "email",
  "name",
  "role",
  "status",
  "createdAt"
FROM "User"
WHERE "role" = 'ADMIN'
ORDER BY "createdAt" DESC;

-- ============================================
-- ALTERNATIVE: Using pgcrypto extension
-- ============================================
-- If you want to hash password directly in SQL:
-- (Requires pgcrypto extension)

-- Enable extension (if not already enabled):
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Then use this insert:
/*
INSERT INTO "User" (
  "id",
  "email",
  "password",
  "name",
  "role",
  "status",
  "discount",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@motivcompany.com',
  crypt('MotivAdmin2024!', gen_salt('bf', 10)),
  'Motiv Administrator',
  'ADMIN',
  'ACTIVE',
  0,
  NOW(),
  NOW()
) ON CONFLICT ("email") DO UPDATE SET
  "password" = crypt('MotivAdmin2024!', gen_salt('bf', 10)),
  "name" = EXCLUDED."name",
  "role" = 'ADMIN',
  "status" = 'ACTIVE',
  "updatedAt" = NOW();
*/

-- ============================================
-- DELETE ADMIN (if needed)
-- ============================================
-- DELETE FROM "User" WHERE "email" = 'admin@motivcompany.com';
