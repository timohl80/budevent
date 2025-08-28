-- Add provider field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20);

-- Update existing users to have 'email' as provider (since they were created via email registration)
UPDATE users SET provider = 'email' WHERE provider IS NULL;

-- Make provider field required
ALTER TABLE users ALTER COLUMN provider SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);

-- Verify the changes
SELECT provider, COUNT(*) as user_count 
FROM users 
GROUP BY provider;
