-- Setup Storage Bucket for Event Images
-- Run this script in Supabase SQL Editor to create the storage bucket

-- Create the storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Note: Storage policies need to be configured through the Supabase Dashboard
-- Go to Storage > Policies and set the following policies manually:
-- 
-- 1. For bucket 'event-images':
--    - SELECT: Allow public access (for viewing images)
--    - INSERT: Allow authenticated users only
--    - UPDATE: Allow authenticated users only  
--    - DELETE: Allow authenticated users only
--
-- 2. Or use these policy names in the dashboard:
--    - "Public Access" (SELECT)
--    - "Authenticated users can upload" (INSERT)
--    - "Authenticated users can update" (UPDATE)
--    - "Authenticated users can delete" (DELETE)
