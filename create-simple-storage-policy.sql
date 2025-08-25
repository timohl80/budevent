-- Create a simple, permissive storage policy for testing
-- This will allow all authenticated users to access the storage bucket

-- First, drop ALL existing policies for storage.objects
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public can view" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated storage access" ON storage.objects;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all authenticated storage operations" ON storage.objects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also create a policy for public read access
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT
    TO public
    USING (true);

-- Verify the new policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
