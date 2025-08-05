-- Remove unused SCM columns that are no longer needed
-- The form now only uses scm_logistic and scm_warehouse sections

-- Drop the unused SCM inventory and procurement columns
ALTER TABLE public.survey_responses 
DROP COLUMN IF EXISTS scm_inventory_question1,
DROP COLUMN IF EXISTS scm_inventory_question2,
DROP COLUMN IF EXISTS scm_inventory_feedback,
DROP COLUMN IF EXISTS scm_procurement_question1,
DROP COLUMN IF EXISTS scm_procurement_question2,
DROP COLUMN IF EXISTS scm_procurement_feedback;