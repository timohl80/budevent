-- Fix RLS Security Issues for BudEvent
-- This script enables Row Level Security on tables that need it

-- Enable RLS on event_invitations table
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on event_rsvps table  
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled (these should return 't' for true)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('event_invitations', 'event_rsvps') 
AND schemaname = 'public';

-- Check existing policies on event_invitations
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'event_invitations' 
AND schemaname = 'public';

-- Check existing policies on event_rsvps
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'event_rsvps' 
AND schemaname = 'public';
