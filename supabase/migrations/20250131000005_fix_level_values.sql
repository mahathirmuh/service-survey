-- Fix level column values to match application expectations
-- Change from 'Non-Managerial' to 'Non Managerial' (space instead of hyphen)

-- Update employees table
ALTER TABLE public.employees 
DROP CONSTRAINT IF EXISTS employees_level_check;

UPDATE public.employees 
SET level = 'Non Managerial' 
WHERE level = 'Non-Managerial';

ALTER TABLE public.employees 
ADD CONSTRAINT employees_level_check 
CHECK (level IN ('Managerial', 'Non Managerial'));

-- Update survey_responses table
ALTER TABLE public.survey_responses 
DROP CONSTRAINT IF EXISTS survey_responses_level_check;

UPDATE public.survey_responses 
SET level = 'Non Managerial' 
WHERE level = 'Non-Managerial';

ALTER TABLE public.survey_responses 
ADD CONSTRAINT survey_responses_level_check 
CHECK (level IN ('Managerial', 'Non Managerial'));

-- Update default values
ALTER TABLE public.employees 
ALTER COLUMN level SET DEFAULT 'Non Managerial';

ALTER TABLE public.survey_responses 
ALTER COLUMN level SET DEFAULT 'Non Managerial';

-- Update comments
COMMENT ON COLUMN public.employees.level IS 'Employee level: Managerial or Non Managerial';
COMMENT ON COLUMN public.survey_responses.level IS 'Employee level at the time of survey submission: Managerial or Non Managerial. Preserves historical level data even if employee level changes later.';