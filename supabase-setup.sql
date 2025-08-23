-- Create the events table in Supabase
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all users to read events
CREATE POLICY "Allow public read access" ON public.events
    FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert events
CREATE POLICY "Allow authenticated insert" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows users to update their own events
CREATE POLICY "Allow authenticated update" ON public.events
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a policy that allows users to delete their own events
CREATE POLICY "Allow authenticated delete" ON public.events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create an index on starts_at for better query performance
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);

-- Insert some sample data
INSERT INTO public.events (title, description, starts_at, location) VALUES
    ('Tech Meetup: Next.js Best Practices', 'Join us for an evening of learning about Next.js best practices, performance optimization, and real-world applications. Network with fellow developers and share your experiences.', '2024-02-15T18:00:00Z', 'Downtown Conference Center'),
    ('Community Garden Workshop', 'Learn sustainable gardening techniques, composting methods, and how to grow your own vegetables. Perfect for beginners and experienced gardeners alike.', '2024-02-18T10:00:00Z', 'Community Garden Park'),
    ('Local Music Festival', 'A day filled with local bands, food trucks, and community spirit. Bring your family and friends for an unforgettable musical experience.', '2024-02-20T16:00:00Z', 'Riverside Amphitheater'),
    ('Book Club: Science Fiction Edition', 'Discuss the latest science fiction novels, share your thoughts on futuristic themes, and discover new authors in this genre.', '2024-02-22T19:00:00Z', 'Central Library')
ON CONFLICT DO NOTHING;
