-- ============================================
-- STEP 1: BACKUP USER DATA
-- Run this FIRST in Supabase SQL Editor
-- Copy the result and save it!
-- ============================================

SELECT 
    'INSERT INTO "User" ("id", "name", "email", "password", "role", "status", "businessName", "phone", "address", "discount", "createdAt", "updatedAt") VALUES (' ||
    '''' || id || ''', ' ||
    '''' || name || ''', ' ||
    '''' || email || ''', ' ||
    '''' || password || ''', ' ||
    '''' || role || ''', ' ||
    '''' || status || ''', ' ||
    COALESCE('''' || "businessName" || '''', 'NULL') || ', ' ||
    COALESCE('''' || phone || '''', 'NULL') || ', ' ||
    COALESCE('''' || address || '''', 'NULL') || ', ' ||
    discount || ', ' ||
    '''' || "createdAt" || ''', ' ||
    '''' || "updatedAt" || ''');'
FROM "User"
ORDER BY "createdAt";

-- ============================================
-- RESULT: Copy semua hasil query ini!
-- Nanti paste lagi setelah reset database
-- ============================================
