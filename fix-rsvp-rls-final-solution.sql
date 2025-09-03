-- Final solution for RSVP RLS policies
-- This creates policies that work with NextAuth and anonymous Supabase client

-- Re-enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow read RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow create RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow update RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow delete RSVPs" ON public.event_rsvps;

-- Create policies that work with your system
-- 1. Allow anyone to read RSVPs (needed for displaying counts)
CREATE POLICY "Allow read RSVPs" ON public.event_rsvps
    FOR SELECT
    USING (true);

-- 2. Allow inserts for any user_id (since we validate user_id in the API)
-- The API already validates that the user is authenticated and owns the user_id
CREATE POLICY "Allow create RSVPs" ON public.event_rsvps
    FOR INSERT
    WITH CHECK (user_id IS NOT NULL);

-- 3. Allow updates for any user_id (since we validate in the API)
CREATE POLICY "Allow update RSVPs" ON public.event_rsvps
    FOR UPDATE
    USING (user_id IS NOT NULL)
    WITH CHECK (user_id IS NOT NULL);

-- 4. Allow deletes for any user_id (since we validate in the API)
CREATE POLICY "Allow delete RSVPs" ON public.event_rsvps
    FOR DELETE
    USING (user_id IS NOT NULL);

-- Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'event_rsvps' 
AND schemaname = 'public'
ORDER BY policyname;
