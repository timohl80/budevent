-- Fix image_url column to handle long base64 strings
-- Run this in Supabase SQL Editor

-- Check current column type
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'image_url';

-- Alter the column to use TEXT type (unlimited length) instead of VARCHAR
ALTER TABLE public.events 
ALTER COLUMN image_url TYPE TEXT;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'image_url';
