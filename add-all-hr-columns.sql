-- Add all HR columns to survey_responses table
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS hr_comben_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_comben_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_comben_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_recruitment_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_recruitment_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_recruitment_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_training_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_training_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_training_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_performance_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_performance_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_performance_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_ir_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_ir_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_ir_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_documentcontrol_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_documentcontrol_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_documentcontrol_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_itsupport_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itsupport_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itsupport_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_itfield_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itfield_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itfield_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_siteservice_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_siteservice_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_siteservice_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_peopledev_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_peopledev_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_peopledev_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_translator_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_translator_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_translator_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_talentacquisition_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_talentacquisition_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_talentacquisition_feedback TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'hr_%';