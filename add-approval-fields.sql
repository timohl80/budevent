-- Add approval fields to users table
-- Run this script in your Supabase SQL editor

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approval_notes TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER';

-- Create enum for user roles (if not exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing users to be approved (since they already exist)
UPDATE users 
SET is_approved = true, 
    approved_at = created_at,
    role = 'USER'
WHERE is_approved IS NULL;

-- Set your email as admin
UPDATE users 
SET role = 'ADMIN',
    is_approved = true,
    approved_at = created_at
WHERE email = 'timohl@hotmail.com';

-- Create index for faster approval queries
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comments for documentation
COMMENT ON COLUMN users.is_approved IS 'Whether the user account has been approved by an admin';
COMMENT ON COLUMN users.approved_at IS 'When the user was approved';
COMMENT ON COLUMN users.approved_by IS 'ID of the admin who approved the user';
COMMENT ON COLUMN users.approval_notes IS 'Notes about approval/rejection';
COMMENT ON COLUMN users.role IS 'User role: USER, ADMIN, or MODERATOR';
