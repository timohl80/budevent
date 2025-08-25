-- Check the event_rsvps table structure and RLS policies
-- Run this in Supabase SQL Editor

-- Check if the table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'event_rsvps';

-- Check the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_rsvps' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'event_rsvps' 
AND schemaname = 'public';

-- Check existing RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'event_rsvps' 
AND schemaname = 'public';

-- Check if there are any existing RSVPs
SELECT COUNT(*) as total_rsvps FROM public.event_rsvps;
