-- Database Repair Script for Employees Table
-- Run this script in your Supabase SQL Editor to add missing columns

-- Add status column if it doesn't exist
DO $$
BEGIN
    -- Check if the status column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'status'
    ) THEN
        -- Add the status column
        ALTER TABLE public.employees 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'Not Submitted' 
        CHECK (status IN ('Submitted', 'Not Submitted'));
        
        -- Create index for performance on status lookups
        CREATE INDEX IF NOT EXISTS IX_employees_status ON public.employees(status);
        
        -- Update existing employees to have default status
        UPDATE public.employees 
        SET status = 'Not Submitted' 
        WHERE status IS NULL;
        
        RAISE NOTICE 'Status column added to employees table';
    ELSE
        RAISE NOTICE 'Status column already exists in employees table';
    END IF;
END
$$;

-- Add email column if it doesn't exist
DO $$
BEGIN
    -- Check if the email column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'email'
    ) THEN
        -- Add the email column
        ALTER TABLE public.employees 
        ADD COLUMN email TEXT;
        
        -- Create index for performance on email lookups
        CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);
        
        RAISE NOTICE 'Email column added to employees table';
    ELSE
        RAISE NOTICE 'Email column already exists in employees table';
    END IF;
END
$$;

-- Add level column if it doesn't exist
DO $$
BEGIN
    -- Check if the level column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employees' 
        AND column_name = 'level'
    ) THEN
        -- Add the level column
        ALTER TABLE public.employees 
        ADD COLUMN level TEXT NOT NULL DEFAULT 'Non-Managerial' 
        CHECK (level IN ('Managerial', 'Non-Managerial'));
        
        -- Create index for performance on level lookups
        CREATE INDEX IF NOT EXISTS IX_employees_level ON public.employees(level);
        
        RAISE NOTICE 'Level column added to employees table';
    ELSE
        RAISE NOTICE 'Level column already exists in employees table';
    END IF;
END
$$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'employees'
ORDER BY ordinal_position;

-- Show a sample of the data to verify everything is working
SELECT id, id_badge_number, name, department, status, email, level, created_at
FROM public.employees
LIMIT 5;