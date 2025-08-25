-- Enhanced Events Schema for BudEvent
-- This script adds: event images, capacity limits, RSVP functionality, and comments

-- 1. Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity > 0),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed'));

-- 2. Create RSVP table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id) -- One RSVP per user per event
);

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS public.event_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
    parent_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE, -- For nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS event_rsvps_event_id_idx ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS event_rsvps_user_id_idx ON public.event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS event_rsvps_status_idx ON public.event_rsvps(status);

CREATE INDEX IF NOT EXISTS event_comments_event_id_idx ON public.event_comments(event_id);
CREATE INDEX IF NOT EXISTS event_comments_user_id_idx ON public.event_comments(user_id);
CREATE INDEX IF NOT EXISTS event_comments_parent_id_idx ON public.event_comments(parent_id);
CREATE INDEX IF NOT EXISTS event_comments_created_at_idx ON public.event_comments(created_at);

-- 5. Enable RLS on new tables
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for RSVPs
CREATE POLICY "Allow public read access" ON public.event_rsvps
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.event_rsvps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owner update" ON public.event_rsvps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owner delete" ON public.event_rsvps
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for comments
CREATE POLICY "Allow public read access" ON public.event_comments
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.event_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owner update" ON public.event_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owner delete" ON public.event_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Update events table RLS policies to include new columns
DROP POLICY IF EXISTS "Allow insert with user_id" ON public.events;
DROP POLICY IF EXISTS "Allow update by owner" ON public.events;

CREATE POLICY "Allow insert with user_id" ON public.events
    FOR INSERT WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Allow update by owner" ON public.events
    FOR UPDATE USING (user_id IS NOT NULL);

-- 9. Add some sample data for testing (optional)
-- INSERT INTO public.events (title, description, starts_at, location, user_id, capacity, image_url) 
-- VALUES ('Sample Event with Capacity', 'This is a sample event to test new features', '2025-01-15T18:00:00Z', 'Sample Location', 
--         (SELECT id FROM public.users LIMIT 1), 50, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800');
