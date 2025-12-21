-- Migration: Add Google OAuth support to users table
-- Run this to update existing database

-- Add google_id column if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add profile_picture column if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Make phone nullable (for Google OAuth users who may not have phone)
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL;

-- Make password_hash nullable (for Google OAuth users)
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Remove unique constraint from phone if exists
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_phone_key;

-- Display success message
SELECT 'Migration completed successfully!' AS status;
