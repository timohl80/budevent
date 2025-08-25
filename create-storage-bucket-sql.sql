-- Create Storage Bucket via SQL (might bypass RLS)
-- Run this in Supabase SQL Editor

-- Method 1: Direct insert (might work)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Method 2: If Method 1 fails, try this
-- First check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'event-images';

-- Method 3: If both fail, create via dashboard
-- Go to Storage → Create bucket manually
