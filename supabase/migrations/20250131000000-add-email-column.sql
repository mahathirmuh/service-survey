-- Add email column to survey_responses table
-- This migration adds the required email field for survey submissions

ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

-- Create index for performance on email lookups
CREATE INDEX IF NOT EXISTS IX_survey_responses_email ON public.survey_responses(email);

-- Add comment for documentation
COMMENT ON COLUMN survey_responses.email IS 'Employee email address collected during survey submission. Required field for contact and verification purposes.';