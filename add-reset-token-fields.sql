-- Add reset token fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when looking up reset tokens
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('reset_token', 'reset_token_expiry');
