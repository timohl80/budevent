-- Fix Supabase Storage RLS policies for event-images-v2 bucket
-- Run this in Supabase SQL Editor

-- First, let's check what columns exist in storage.objects
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' 
AND table_name = 'objects';

-- Then check what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Drop existing policies for storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public can view" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- Create new policies for the event-images-v2 bucket
-- Policy 1: Allow public to view images
CREATE POLICY "Public can view event images" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'event-images-v2');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload event images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'event-images-v2');

-- Policy 3: Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update event images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'event-images-v2')
    WITH CHECK (bucket_id = 'event-images-v2');

-- Policy 4: Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete event images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'event-images-v2');

-- Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%event images%';
