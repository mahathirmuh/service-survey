-- Add external_govrel columns to survey_responses table
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS external_govrel_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_govrel_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_govrel_feedback TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'external_govrel%';