-- Fix RLS policies for event_invitations table
-- Run this script in your Supabase SQL editor

-- First, drop the existing policies
DROP POLICY IF EXISTS "Users can view their invitations" ON public.event_invitations;
DROP POLICY IF EXISTS "Event creators can create invitations" ON public.event_invitations;
DROP POLICY IF EXISTS "Invited users can update status" ON public.event_invitations;
DROP POLICY IF EXISTS "Event creators can cancel invitations" ON public.event_invitations;

-- Create new policies that work with your user system
-- Note: These policies assume you're using the users table with string IDs, not Supabase auth

-- Allow users to view invitations sent to them or sent by them
-- This policy allows all authenticated users to view invitations
-- You might want to restrict this further based on your needs
CREATE POLICY "Users can view their invitations" ON public.event_invitations
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow event creators to create invitations
-- This policy allows any authenticated user to create invitations
-- The application logic should verify event ownership
CREATE POLICY "Event creators can create invitations" ON public.event_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow invited users to update their invitation status
-- This policy allows any authenticated user to update invitation status
-- The application logic should verify the user is the invited user
CREATE POLICY "Invited users can update status" ON public.event_invitations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow event creators to cancel invitations
-- This policy allows any authenticated user to update invitations
-- The application logic should verify event ownership
CREATE POLICY "Event creators can cancel invitations" ON public.event_invitations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Alternative: More restrictive policies if you want to use Supabase auth
-- Uncomment these if you want to use Supabase auth instead of the above

/*
-- More restrictive policies using Supabase auth
-- These assume you're using Supabase auth and storing auth.uid() in your users table

-- Allow users to view invitations sent to them or sent by them
CREATE POLICY "Users can view their invitations" ON public.event_invitations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_user_id
        ) OR 
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_by_user_id
        )
    );

-- Allow event creators to create invitations
CREATE POLICY "Event creators can create invitations" ON public.event_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_by_user_id
        ) AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND user_id = auth.uid()::text
        )
    );

-- Allow invited users to update their invitation status
CREATE POLICY "Invited users can update status" ON public.event_invitations
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_user_id
        )
    )
    WITH CHECK (
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_user_id
        )
    );

-- Allow event creators to cancel invitations
CREATE POLICY "Event creators can cancel invitations" ON public.event_invitations
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_by_user_id
        ) AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        auth.uid()::text IN (
            SELECT id FROM public.users WHERE id = invited_by_user_id
        ) AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND user_id = auth.uid()::text
        )
    );
*/
