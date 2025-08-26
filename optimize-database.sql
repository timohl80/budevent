-- Database Optimization Script for BudEvent
-- This script adds indexes and optimizations to improve query performance

-- 1. Add indexes to the events table for faster queries
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- 2. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_user_status ON events(user_id, status);
CREATE INDEX IF NOT EXISTS idx_events_public_status ON events(is_public, status);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON events(starts_at, status);

-- 3. Add text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_events_title_gin ON events USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_events_description_gin ON events USING gin(to_tsvector('english', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_events_location_gin ON events USING gin(to_tsvector('english', COALESCE(location, '')));

-- 4. Add indexes to the event_rsvps table
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(status);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_created_at ON event_rsvps(created_at);

-- 5. Add composite indexes for RSVP queries
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_user ON event_rsvps(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_status ON event_rsvps(user_id, status);

-- 6. Add indexes to the event_comments table
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user_id ON event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_parent_id ON event_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_created_at ON event_comments(created_at);

-- 7. Add indexes to the users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 8. Analyze tables to update statistics
ANALYZE events;
ANALYZE event_rsvps;
ANALYZE event_comments;
ANALYZE users;

-- 9. Set statement timeout to a reasonable value (optional)
-- ALTER DATABASE your_database_name SET statement_timeout = '30s';

-- 10. Check if indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('events', 'event_rsvps', 'event_comments', 'users')
ORDER BY tablename, indexname;
