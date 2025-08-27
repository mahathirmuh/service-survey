-- Add SCM (Supply Chain Management) columns to survey_responses table
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS scm_inventory_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_inventory_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_inventory_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_procurement_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_procurement_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_procurement_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_logistic_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_logistic_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_logistic_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_warehouse_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_warehouse_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_warehouse_feedback TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'scm_%';