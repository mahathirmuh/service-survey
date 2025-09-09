-- Ensure admin_users table has name column
-- This migration is idempotent and safe to run multiple times

DO $$
BEGIN
    -- Check if name column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.admin_users ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown';
    END IF;
END $$;

-- Update any existing records that might have empty names
UPDATE public.admin_users 
SET name = username 
WHERE name IS NULL OR name = '' OR name = 'Unknown';