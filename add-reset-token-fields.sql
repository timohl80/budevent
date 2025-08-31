-- Add reset token fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token_expiry ON users(reset_token_expiry);

-- Add comment for documentation
COMMENT ON COLUMN users.reset_token IS 'Temporary token for password reset';
COMMENT ON COLUMN users.reset_token_expiry IS 'Expiration time for reset token';
