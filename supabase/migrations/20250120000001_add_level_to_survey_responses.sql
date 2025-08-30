-- Add level column to survey_responses table to track employee level at time of submission
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Non-Managerial' 
CHECK (level IN ('Managerial', 'Non-Managerial'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_survey_responses_level ON public.survey_responses(level);

-- Update existing survey responses with current employee levels
UPDATE public.survey_responses 
SET level = COALESCE(
    (SELECT e.level 
     FROM public.employees e 
     WHERE e.id_badge_number = survey_responses.id_badge_number), 
    'Non-Managerial'
)
WHERE level = 'Non-Managerial'; -- Only update default values

-- Add comment for documentation
COMMENT ON COLUMN survey_responses.level IS 'Employee level at the time of survey submission: Managerial or Non-Managerial. Preserves historical level data even if employee level changes later.';