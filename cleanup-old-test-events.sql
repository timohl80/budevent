-- Cleanup Old Test Events
-- This script helps identify and safely delete old test events

-- Step 1: First, let's see what events we have and their characteristics
SELECT 
    id,
    title,
    description,
    starts_at,
    created_at,
    user_id,
    status,
    CASE 
        WHEN user_id IS NULL THEN 'NO OWNER - CAN DELETE'
        WHEN title LIKE '%test%' OR title LIKE '%Test%' THEN 'TEST EVENT - CAN DELETE'
        WHEN title LIKE '%sample%' OR title LIKE '%Sample%' THEN 'SAMPLE EVENT - CAN DELETE'
        WHEN title ~ '^[0-9]+$' THEN 'NUMERIC TITLE - LIKELY TEST'
        WHEN LENGTH(title) < 5 THEN 'VERY SHORT TITLE - LIKELY TEST'
        WHEN description IS NULL OR description = '' THEN 'NO DESCRIPTION - SUSPICIOUS'
        ELSE 'LOOKS LEGITIMATE'
    END as classification,
    CASE 
        WHEN user_id IS NULL THEN 'HIGH'
        WHEN title LIKE '%test%' OR title LIKE '%Test%' THEN 'HIGH'
        WHEN title LIKE '%sample%' OR title LIKE '%Sample%' THEN 'HIGH'
        WHEN title ~ '^[0-9]+$' THEN 'MEDIUM'
        WHEN LENGTH(title) < 5 THEN 'MEDIUM'
        WHEN description IS NULL OR description = '' THEN 'LOW'
        ELSE 'LOW'
    END as deletion_priority
FROM public.events 
ORDER BY 
    CASE 
        WHEN user_id IS NULL THEN 1
        WHEN title LIKE '%test%' OR title LIKE '%Test%' THEN 2
        WHEN title LIKE '%sample%' OR title LIKE '%Sample%' THEN 3
        WHEN title ~ '^[0-9]+$' THEN 4
        WHEN LENGTH(title) < 5 THEN 5
        ELSE 6
    END,
    created_at ASC;

-- Step 2: Count events by classification
SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as no_owner,
    COUNT(CASE WHEN title LIKE '%test%' OR title LIKE '%Test%' THEN 1 END) as test_events,
    COUNT(CASE WHEN title LIKE '%sample%' OR title LIKE '%Sample%' THEN 1 END) as sample_events,
    COUNT(CASE WHEN title ~ '^[0-9]+$' THEN 1 END) as numeric_titles,
    COUNT(CASE WHEN LENGTH(title) < 5 THEN 1 END) as short_titles,
    COUNT(CASE WHEN description IS NULL OR description = '' THEN 1 END) as no_description
FROM public.events;

-- Step 3: SAFE DELETE OPTIONS (uncomment the one you want to use)

-- Option A: Delete only events with NO user_id (safest)
-- DELETE FROM public.events WHERE user_id IS NULL;

-- Option B: Delete test/sample events (moderately safe)
-- DELETE FROM public.events 
-- WHERE user_id IS NULL 
--    OR title ILIKE '%test%' 
--    OR title ILIKE '%sample%';

-- Option C: Delete numeric title events (if they're clearly test data)
-- DELETE FROM public.events 
-- WHERE user_id IS NULL 
--    OR title ILIKE '%test%' 
--    OR title ILIKE '%sample%'
--    OR title ~ '^[0-9]+$';

-- Option D: Aggressive cleanup (delete all suspicious events)
-- DELETE FROM public.events 
-- WHERE user_id IS NULL 
--    OR title ILIKE '%test%' 
--    OR title ILIKE '%sample%'
--    OR title ~ '^[0-9]+$'
--    OR LENGTH(title) < 5;

-- Step 4: After deletion, verify the cleanup
-- SELECT 
--     COUNT(*) as remaining_events,
--     COUNT(user_id) as events_with_owner,
--     COUNT(*) - COUNT(user_id) as events_without_owner
-- FROM public.events;

-- Step 5: Check remaining events to ensure legitimate ones weren't deleted
-- SELECT 
--     id,
--     title,
--     description,
--     starts_at,
--     user_id,
--     status
-- FROM public.events 
-- ORDER BY created_at DESC
-- LIMIT 20;
