-- ========================================
-- INSERT/UPDATE ADMIN USER
-- ========================================
-- Email: admin@motiv.com
-- Password: Motiv@Admin123
-- Role: ADMIN
-- ========================================

-- Delete existing admin if any (optional)
DELETE FROM "User" WHERE email = 'admin@motiv.com';

-- Insert new admin user
INSERT INTO "User" (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'Admin Motiv',
    'admin@motiv.com',
    '$2a$10$5W0XShrzWwv5qTDHnS3c9.OlgmkciKFq44quZ4NX45KsRF1Jc58XC',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify admin user created
SELECT id, name, email, role, status, "createdAt" 
FROM "User" 
WHERE email = 'admin@motiv.com';

-- ========================================
-- RESULT SHOULD SHOW:
-- ========================================
-- id: admin-001
-- name: Admin Motiv
-- email: admin@motiv.com
-- role: ADMIN
-- status: ACTIVE
-- ========================================
