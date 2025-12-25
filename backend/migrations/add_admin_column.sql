-- Add is_admin column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        
        -- Update the first user to be admin (optional)
        UPDATE users SET is_admin = TRUE WHERE id = 1;
        
        RAISE NOTICE 'Column is_admin added to users table';
    ELSE
        RAISE NOTICE 'Column is_admin already exists';
    END IF;
END $$;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Show current admin users
SELECT id, email, first_name, last_name, is_admin 
FROM users 
WHERE is_admin = TRUE;
