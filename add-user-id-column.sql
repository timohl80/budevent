-- Add user_id column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to include user_id
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.events;
DROP POLICY IF EXISTS "Allow public insert" ON public.events;
DROP POLICY IF EXISTS "Allow public update" ON public.events;
DROP POLICY IF EXISTS "Allow public delete" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.events;
DROP POLICY IF EXISTS "Allow owner update" ON public.events;
DROP POLICY IF EXISTS "Allow owner delete" ON public.events;

-- Create new RLS policies that consider user_id
CREATE POLICY "Allow public read access" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owner update" ON public.events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owner delete" ON public.events
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
