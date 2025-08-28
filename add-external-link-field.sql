-- Add external_link field to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_link TEXT;

-- Add index for better performance when filtering by external links
CREATE INDEX IF NOT EXISTS idx_events_external_link ON events(external_link);

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
AND column_name = 'external_link';
