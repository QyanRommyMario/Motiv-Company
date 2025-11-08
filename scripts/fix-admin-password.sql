-- ========================================
-- FIX ADMIN PASSWORD HASH
-- ========================================
-- This script will update admin password to: Motiv@Admin123
-- The hash in database is WRONG, we need to replace it
-- ========================================

-- Update admin password with CORRECT hash
UPDATE "User" 
SET password = '$2a$10$5W0XShrzWwv5qTDHnS3c9.OlgmkciKFq44quZ4NX45KsRF1Jc58XC',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE email = 'admin@motiv.com';

-- Verify the update
SELECT 
    id, 
    name, 
    email, 
    LEFT(password, 30) || '...' as password_preview,
    role, 
    status,
    "updatedAt"
FROM "User" 
WHERE email = 'admin@motiv.com';

-- ========================================
-- EXPECTED RESULT:
-- ========================================
-- email: admin@motiv.com
-- password_preview: $2a$10$5W0XShrzWwv5qTDHnS3c9...
-- role: ADMIN
-- status: ACTIVE
-- ========================================
