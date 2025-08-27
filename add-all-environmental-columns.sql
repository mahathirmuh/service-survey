-- SQL script to add all missing environmental columns
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT,
ADD COLUMN IF NOT EXISTS environmental_management_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_feedback TEXT,
ADD COLUMN IF NOT EXISTS environmental_monitoring_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_monitoring_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_monitoring_feedback TEXT,
ADD COLUMN IF NOT EXISTS environmental_study_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_study_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_study_feedback TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'environmental_%';