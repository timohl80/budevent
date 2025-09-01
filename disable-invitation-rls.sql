-- Temporarily disable RLS for event_invitations table for testing
-- Run this script in your Supabase SQL editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their invitations" ON public.event_invitations;
DROP POLICY IF EXISTS "Event creators can create invitations" ON public.event_invitations;
DROP POLICY IF EXISTS "Invited users can update status" ON public.event_invitations;
DROP POLICY IF EXISTS "Event creators can cancel invitations" ON public.event_invitations;

-- Disable RLS temporarily for testing
ALTER TABLE public.event_invitations DISABLE ROW LEVEL SECURITY;

-- Add a comment to remind you to re-enable RLS later
COMMENT ON TABLE public.event_invitations IS 'RLS temporarily disabled for testing - remember to re-enable with proper policies';
