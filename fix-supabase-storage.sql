-- ============================================
-- FIX SUPABASE STORAGE - Bucket Policies
-- ============================================

-- For upload to work, you need to set these policies in Supabase Storage UI:
-- 1. Go to: Storage > motiv-uploads > Policies
-- 2. Create new policy:
--    - Policy name: "Allow authenticated uploads"
--    - Allowed operation: INSERT
--    - Target roles: authenticated
--    - USING expression: true
--    - WITH CHECK expression: true

-- 3. Create another policy:
--    - Policy name: "Allow public read"
--    - Allowed operation: SELECT
--    - Target roles: anon, authenticated
--    - USING expression: true

-- Or run this SQL in Supabase SQL Editor:

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read images" ON storage.objects;

-- Create upload policy for authenticated users
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'motiv-uploads');

-- Create read policy for everyone
CREATE POLICY "Allow public to read images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'motiv-uploads');

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
