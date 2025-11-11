-- Check B2BRequest columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'B2BRequest'
ORDER BY ordinal_position;
