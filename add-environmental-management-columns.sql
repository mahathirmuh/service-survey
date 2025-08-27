-- SQL script to add missing environmental_management columns
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS environmental_management_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_feedback TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'environmental_management%';