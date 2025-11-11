-- ============================================
-- CHECK ALL TABLES - COMPARE WITH PRISMA SCHEMA
-- ============================================

-- 1. Check ProductVariant (should have 'name' not 'size')
SELECT 'ProductVariant:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ProductVariant'
ORDER BY ordinal_position;

-- 2. Check Order (should have shipping columns)
SELECT 'Order:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Order'
ORDER BY ordinal_position;

-- 3. Check Product (should have 'features' column)
SELECT 'Product:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Product'
ORDER BY ordinal_position;

-- 4. Check Story (should have 'featuredImage')
SELECT 'Story:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Story'
ORDER BY ordinal_position;

-- 5. Check User
SELECT 'User:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- 6. Check ShippingAddress (should have 'country')
SELECT 'ShippingAddress:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ShippingAddress'
ORDER BY ordinal_position;

-- 7. List ALL tables
SELECT 'ALL TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
