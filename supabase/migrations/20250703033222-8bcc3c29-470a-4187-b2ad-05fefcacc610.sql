-- Fix database constraints to allow proper data insertion
-- Set default values for all question fields that might not be filled

-- Update all question columns to have default values
ALTER TABLE public.survey_responses 
ALTER COLUMN external_assetprotection_question1 SET DEFAULT 0,
ALTER COLUMN external_assetprotection_question2 SET DEFAULT 0,
ALTER COLUMN external_govrel_question1 SET DEFAULT 0,
ALTER COLUMN external_govrel_question2 SET DEFAULT 0,
ALTER COLUMN ohs_training_question1 SET DEFAULT 0,
ALTER COLUMN ohs_training_question2 SET DEFAULT 0,
ALTER COLUMN scm_inventory_question1 SET DEFAULT 0,
ALTER COLUMN scm_inventory_question2 SET DEFAULT 0,
ALTER COLUMN scm_procurement_question1 SET DEFAULT 0,
ALTER COLUMN scm_procurement_question2 SET DEFAULT 0;