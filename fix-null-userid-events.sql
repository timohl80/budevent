-- Fix events with null userId
-- This script addresses the issue where some events have userId = null
-- which prevents users from editing their own events

-- Step 1: First, let's see what events have null userId
SELECT 
    id, 
    title, 
    created_at, 
    user_id,
    CASE 
        WHEN user_id IS NULL THEN 'NEEDS FIXING'
        ELSE 'OK'
    END as status
FROM public.events 
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- Step 2: Check the total count of events and their userId status
SELECT 
    COUNT(*) as total_events,
    COUNT(user_id) as events_with_user_id,
    COUNT(*) - COUNT(user_id) as events_without_user_id
FROM public.events;

-- Step 3: Choose one of the following solutions:

-- SOLUTION A: Assign null userId events to a specific user (RECOMMENDED)
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the users table
-- First, find your user ID:
-- SELECT id, email, name FROM auth.users WHERE email = 'your-email@example.com';

-- Then run this (replace with your actual user ID):
-- UPDATE public.events 
-- SET user_id = 'YOUR_USER_ID_HERE'  -- Replace with actual user ID
-- WHERE user_id IS NULL;

-- SOLUTION B: Delete events with null userId (if they're test/sample data)
-- WARNING: This will permanently delete events!
-- DELETE FROM public.events WHERE user_id IS NULL;

-- SOLUTION C: Mark events with null userId as cancelled (safer approach)
-- UPDATE public.events 
-- SET status = 'cancelled' 
-- WHERE user_id IS NULL;

-- SOLUTION D: Create a default system user and assign null events to them
-- This creates a system user and assigns orphaned events to them
-- INSERT INTO auth.users (id, email, name, is_approved, role, created_at)
-- VALUES (
--     gen_random_uuid(),
--     'system@budevent.se',
--     'System User',
--     true,
--     'USER',
--     NOW()
-- ) ON CONFLICT DO NOTHING;
--
-- UPDATE public.events 
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'system@budevent.se')
-- WHERE user_id IS NULL;

-- Step 4: After running one of the above solutions, verify the fix:
-- SELECT 
--     COUNT(*) as total_events,
--     COUNT(user_id) as events_with_user_id,
--     COUNT(*) - COUNT(user_id) as events_without_user_id
-- FROM public.events;

-- Step 5: Check that all events now have a userId:
-- SELECT 
--     id, 
--     title, 
--     user_id,
--     CASE 
--         WHEN user_id IS NULL THEN 'STILL NEEDS FIXING'
--         ELSE 'FIXED'
--     END as status
-- FROM public.events 
-- ORDER BY created_at DESC;
