-- Add Event Invitations System
-- Run this script in your Supabase SQL editor

-- 1. Create event_invitations table
CREATE TABLE IF NOT EXISTS public.event_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    message TEXT, -- Optional personal message from inviter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, invited_user_id) -- One invitation per user per event
);

-- 2. Enable RLS
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Allow users to view invitations sent to them or sent by them
CREATE POLICY "Users can view their invitations" ON public.event_invitations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = invited_user_id OR 
        auth.uid() = invited_by_user_id
    );

-- Allow event creators to create invitations
CREATE POLICY "Event creators can create invitations" ON public.event_invitations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = invited_by_user_id AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND user_id = auth.uid()
        )
    );

-- Allow invited users to update their invitation status
CREATE POLICY "Invited users can update status" ON public.event_invitations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = invited_user_id)
    WITH CHECK (auth.uid() = invited_user_id);

-- Allow event creators to cancel invitations
CREATE POLICY "Event creators can cancel invitations" ON public.event_invitations
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = invited_by_user_id AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = invited_by_user_id AND
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND user_id = auth.uid()
        )
    );

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id ON public.event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_user_id ON public.event_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_by_user_id ON public.event_invitations(invited_by_user_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON public.event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_at ON public.event_invitations(invited_at);

-- 5. Add comments for documentation
COMMENT ON TABLE public.event_invitations IS 'Tracks event invitations sent to users';
COMMENT ON COLUMN public.event_invitations.event_id IS 'The event being invited to';
COMMENT ON COLUMN public.event_invitations.invited_user_id IS 'The user being invited';
COMMENT ON COLUMN public.event_invitations.invited_by_user_id IS 'The user who sent the invitation';
COMMENT ON COLUMN public.event_invitations.status IS 'Invitation status: pending, accepted, declined, cancelled';
COMMENT ON COLUMN public.event_invitations.message IS 'Optional personal message from the inviter';
COMMENT ON COLUMN public.event_invitations.invited_at IS 'When the invitation was sent';
COMMENT ON COLUMN public.event_invitations.responded_at IS 'When the user responded to the invitation';
