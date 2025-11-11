-- Check all tables in Supabase database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if Voucher table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'Voucher'
) as voucher_exists;

-- Check ProductVariant columns (should have 'name' not 'size')
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ProductVariant'
ORDER BY ordinal_position;
