-- Check RLS Policies for Events Table
-- This script helps debug delete permission issues

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'events';

-- 2. Check current RLS policies
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
WHERE tablename = 'events';

-- 3. Check if user has delete permissions
-- Replace 'your_user_id_here' with your actual user ID
SELECT 
    has_table_privilege('your_user_id_here', 'events', 'DELETE') as can_delete,
    has_table_privilege('your_user_id_here', 'events', 'SELECT') as can_select,
    has_table_privilege('your_user_id_here', 'events', 'UPDATE') as can_update;

-- 4. Check current user context
SELECT 
    current_user,
    current_setting('role'),
    current_setting('application_name');

-- 5. Test delete policy manually
-- This will show what the policy is checking
SELECT 
    policyname,
    pg_get_expr(qual, polrelid) as policy_condition
FROM pg_policies 
WHERE tablename = 'events' AND cmd = 'DELETE';

-- 6. Check if there are any foreign key constraints preventing deletion
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'events';

-- 7. Check for any triggers that might interfere with deletion
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'events';
