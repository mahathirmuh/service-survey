-- Complete migration SQL for survey_responses table
-- This file contains all columns needed for the survey_responses table

-- Add all environmental, external, HR, and SCM columns
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
ADD COLUMN IF NOT EXISTS environmental_study_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_assetprotection_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_assetprotection_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_assetprotection_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_govrel_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_govrel_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_govrel_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_communityrelations_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communityrelations_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communityrelations_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_legal_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_legal_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_legal_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_communications_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communications_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communications_feedback TEXT,
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
ADD COLUMN IF NOT EXISTS hr_talentacquisition_feedback TEXT,
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
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name = 'survey_responses' AND
  (column_name LIKE 'environmental_%' OR 
   column_name LIKE 'external_%' OR 
   column_name LIKE 'hr_%' OR
   column_name LIKE 'scm_%');