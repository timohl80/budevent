-- Clean start for RSVP RLS policies
-- Drop all existing policies first, then create new ones

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow read RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow create RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow update RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow delete RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow update own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow delete own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow public read access" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow owner update" ON public.event_rsvps;
DROP POLICY IF EXISTS "Allow owner delete" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can view RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can create RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.event_rsvps;

-- Make sure RLS is enabled
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Create new, simple policies
-- 1. Allow anyone to read RSVPs (needed for displaying counts)
CREATE POLICY "Allow read RSVPs" ON public.event_rsvps
    FOR SELECT
    USING (true);

-- 2. Allow authenticated users to create RSVPs
CREATE POLICY "Allow create RSVPs" ON public.event_rsvps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Allow authenticated users to update RSVPs
CREATE POLICY "Allow update RSVPs" ON public.event_rsvps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Allow authenticated users to delete RSVPs
CREATE POLICY "Allow delete RSVPs" ON public.event_rsvps
    FOR DELETE
    TO authenticated
    USING (true);

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
