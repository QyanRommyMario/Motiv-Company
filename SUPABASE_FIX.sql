-- ========================================
-- SUPABASE DATABASE VERIFICATION
-- Run this to verify schema is correct
-- ========================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- Verify all tables exist with correct columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Count records in each table
SELECT 'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Product', COUNT(*) FROM "Product"
UNION ALL
SELECT 'ProductVariant', COUNT(*) FROM "ProductVariant"
UNION ALL
SELECT 'CartItem', COUNT(*) FROM "CartItem"
UNION ALL
SELECT 'Order', COUNT(*) FROM "Order"
UNION ALL
SELECT 'OrderItem', COUNT(*) FROM "OrderItem"
UNION ALL
SELECT 'Transaction', COUNT(*) FROM "Transaction"
UNION ALL
SELECT 'ShippingAddress', COUNT(*) FROM "ShippingAddress"
UNION ALL
SELECT 'B2BRequest', COUNT(*) FROM "B2BRequest"
UNION ALL
SELECT 'Voucher', COUNT(*) FROM "Voucher"
UNION ALL
SELECT 'Story', COUNT(*) FROM "Story";
