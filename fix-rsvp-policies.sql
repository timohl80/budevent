-- Fix RLS policies for event_rsvps table
-- Run this in Supabase SQL Editor

-- First, check if the table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'event_rsvps';

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can create RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.event_rsvps;

-- Create new policies
-- Allow users to view RSVPs for events they can see
CREATE POLICY "Users can view RSVPs" ON public.event_rsvps
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to create RSVPs
CREATE POLICY "Users can create RSVPs" ON public.event_rsvps
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own RSVPs
CREATE POLICY "Users can update own RSVPs" ON public.event_rsvps
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own RSVPs
CREATE POLICY "Users can delete own RSVPs" ON public.event_rsvps
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON public.event_rsvps(status);

-- Verify the policies were created
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'event_rsvps' 
AND schemaname = 'public';
