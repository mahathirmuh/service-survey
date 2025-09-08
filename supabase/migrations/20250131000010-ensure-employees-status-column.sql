-- Ensure status column exists in employees table
-- This migration safely adds the status column if it doesn't exist

-- Check if status column exists and add it if not
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
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.employees.status IS 'Employee survey submission status. Can be either Submitted or Not Submitted.';
        
        RAISE NOTICE 'Status column added to employees table';
    ELSE
        RAISE NOTICE 'Status column already exists in employees table';
    END IF;
END
$$;

-- Also ensure email column exists in employees table
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
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.employees.email IS 'Employee email address for contact purposes';
        
        RAISE NOTICE 'Email column added to employees table';
    ELSE
        RAISE NOTICE 'Email column already exists in employees table';
    END IF;
END
$$;

-- Ensure level column exists in employees table
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
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.employees.level IS 'Employee level classification. Can be either Managerial or Non-Managerial.';
        
        RAISE NOTICE 'Level column added to employees table';
    ELSE
        RAISE NOTICE 'Level column already exists in employees table';
    END IF;
END
$$;