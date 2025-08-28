-- Fix password_hash constraint for OAuth users
-- This allows Google OAuth users to be created without passwords

-- First, check if the constraint exists
DO $$
BEGIN
    -- Check if the not-null constraint exists on password_hash column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash' 
        AND is_nullable = 'NO'
    ) THEN
        -- Drop the not-null constraint
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
        RAISE NOTICE 'Dropped NOT NULL constraint from password_hash column';
    ELSE
        RAISE NOTICE 'password_hash column is already nullable';
    END IF;
END $$;

-- Verify the change
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'password_hash';

-- Add a comment explaining the change
COMMENT ON COLUMN users.password_hash IS 'Password hash for local authentication. NULL for OAuth users (Google, etc.)';
