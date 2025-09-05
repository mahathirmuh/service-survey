-- Ensure email column exists in survey_responses table
-- This migration safely adds the email column if it doesn't exist

-- Check if email column exists and add it if not
DO $$
BEGIN
    -- Check if the email column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'survey_responses' 
        AND column_name = 'email'
    ) THEN
        -- Add the email column
        ALTER TABLE public.survey_responses 
        ADD COLUMN email TEXT NOT NULL DEFAULT '';
        
        -- Create index for performance on email lookups
        CREATE INDEX IF NOT EXISTS IX_survey_responses_email ON public.survey_responses(email);
        
        -- Add comment for documentation
        COMMENT ON COLUMN survey_responses.email IS 'Employee email address collected during survey submission. Required field for contact and verification purposes.';
        
        RAISE NOTICE 'Email column added to survey_responses table';
    ELSE
        RAISE NOTICE 'Email column already exists in survey_responses table';
    END IF;
END
$$;