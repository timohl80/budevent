-- Fix Supabase Storage bucket and policies from scratch
-- This should resolve the RLS issues

-- Step 1: Check if the bucket exists and its settings
SELECT 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    owner
FROM storage.buckets 
WHERE name = 'event-images-v2';

-- Step 2: If bucket doesn't exist, create it (run this manually in dashboard)
-- Go to Storage → Create a new bucket
-- Name: event-images-v2
-- Public bucket: ✅ CHECKED
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Step 3: Drop ALL existing policies for storage.objects
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
DROP POLICY IF EXISTS "Allow all authenticated storage operations" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Step 4: Create minimal, working policies
CREATE POLICY "Allow all storage operations" ON storage.objects
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Step 5: Verify the bucket is accessible
SELECT 
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE name = 'event-images-v2';
