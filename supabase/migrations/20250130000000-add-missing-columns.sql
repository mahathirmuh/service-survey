-- Add missing columns to survey_responses table
-- This migration adds warehouse columns and other missing HR sections

-- Add SCM Warehouse columns
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS scm_warehouse_question1 INTEGER DEFAULT 0 CHECK (scm_warehouse_question1 >= 0 AND scm_warehouse_question1 <= 5),
ADD COLUMN IF NOT EXISTS scm_warehouse_question2 INTEGER DEFAULT 0 CHECK (scm_warehouse_question2 >= 0 AND scm_warehouse_question2 <= 5),
ADD COLUMN IF NOT EXISTS scm_warehouse_feedback TEXT;

-- Add missing HR sections that are in types.ts but not in database
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS hr_itfield_question1 INTEGER DEFAULT 0 CHECK (hr_itfield_question1 >= 0 AND hr_itfield_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_itfield_question2 INTEGER DEFAULT 0 CHECK (hr_itfield_question2 >= 0 AND hr_itfield_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_itfield_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_siteservice_question1 INTEGER DEFAULT 0 CHECK (hr_siteservice_question1 >= 0 AND hr_siteservice_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_siteservice_question2 INTEGER DEFAULT 0 CHECK (hr_siteservice_question2 >= 0 AND hr_siteservice_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_siteservice_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_peopledev_question1 INTEGER DEFAULT 0 CHECK (hr_peopledev_question1 >= 0 AND hr_peopledev_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_peopledev_question2 INTEGER DEFAULT 0 CHECK (hr_peopledev_question2 >= 0 AND hr_peopledev_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_peopledev_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_comben_question1 INTEGER DEFAULT 0 CHECK (hr_comben_question1 >= 0 AND hr_comben_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_comben_question2 INTEGER DEFAULT 0 CHECK (hr_comben_question2 >= 0 AND hr_comben_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_comben_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_translator_question1 INTEGER DEFAULT 0 CHECK (hr_translator_question1 >= 0 AND hr_translator_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_translator_question2 INTEGER DEFAULT 0 CHECK (hr_translator_question2 >= 0 AND hr_translator_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_translator_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_talentacquisition_question1 INTEGER DEFAULT 0 CHECK (hr_talentacquisition_question1 >= 0 AND hr_talentacquisition_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_talentacquisition_question2 INTEGER DEFAULT 0 CHECK (hr_talentacquisition_question2 >= 0 AND hr_talentacquisition_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_talentacquisition_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_ir_question1 INTEGER DEFAULT 0 CHECK (hr_ir_question1 >= 0 AND hr_ir_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_ir_question2 INTEGER DEFAULT 0 CHECK (hr_ir_question2 >= 0 AND hr_ir_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_ir_feedback TEXT,

ADD COLUMN IF NOT EXISTS scm_logistic_question1 INTEGER DEFAULT 0 CHECK (scm_logistic_question1 >= 0 AND scm_logistic_question1 <= 5),
ADD COLUMN IF NOT EXISTS scm_logistic_question2 INTEGER DEFAULT 0 CHECK (scm_logistic_question2 >= 0 AND scm_logistic_question2 <= 5),
ADD COLUMN IF NOT EXISTS scm_logistic_feedback TEXT;

-- Add missing Environmental sections
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS environmental_monitoring_question1 INTEGER DEFAULT 0 CHECK (environmental_monitoring_question1 >= 0 AND environmental_monitoring_question1 <= 5),
ADD COLUMN IF NOT EXISTS environmental_monitoring_question2 INTEGER DEFAULT 0 CHECK (environmental_monitoring_question2 >= 0 AND environmental_monitoring_question2 <= 5),
ADD COLUMN IF NOT EXISTS environmental_monitoring_feedback TEXT,

ADD COLUMN IF NOT EXISTS environmental_management_question1 INTEGER DEFAULT 0 CHECK (environmental_management_question1 >= 0 AND environmental_management_question1 <= 5),
ADD COLUMN IF NOT EXISTS environmental_management_question2 INTEGER DEFAULT 0 CHECK (environmental_management_question2 >= 0 AND environmental_management_question2 <= 5),
ADD COLUMN IF NOT EXISTS environmental_management_feedback TEXT,

ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0 CHECK (environmental_audit_question1 >= 0 AND environmental_audit_question1 <= 5),
ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0 CHECK (environmental_audit_question2 >= 0 AND environmental_audit_question2 <= 5),
ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT,

ADD COLUMN IF NOT EXISTS environmental_study_question1 INTEGER DEFAULT 0 CHECK (environmental_study_question1 >= 0 AND environmental_study_question1 <= 5),
ADD COLUMN IF NOT EXISTS environmental_study_question2 INTEGER DEFAULT 0 CHECK (environmental_study_question2 >= 0 AND environmental_study_question2 <= 5),
ADD COLUMN IF NOT EXISTS environmental_study_feedback TEXT,

ADD COLUMN IF NOT EXISTS external_communityrelations_question1 INTEGER DEFAULT 0 CHECK (external_communityrelations_question1 >= 0 AND external_communityrelations_question1 <= 5),
ADD COLUMN IF NOT EXISTS external_communityrelations_question2 INTEGER DEFAULT 0 CHECK (external_communityrelations_question2 >= 0 AND external_communityrelations_question2 <= 5),
ADD COLUMN IF NOT EXISTS external_communityrelations_feedback TEXT;

-- Add missing feedback columns for existing sections
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS external_assetprotection_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_govrel_feedback TEXT,
ADD COLUMN IF NOT EXISTS ohs_training_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_inventory_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_procurement_feedback TEXT;

-- Add missing HR document control columns
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS hr_documentcontrol_question1 INTEGER DEFAULT 0 CHECK (hr_documentcontrol_question1 >= 0 AND hr_documentcontrol_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_documentcontrol_question2 INTEGER DEFAULT 0 CHECK (hr_documentcontrol_question2 >= 0 AND hr_documentcontrol_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_documentcontrol_feedback TEXT,

ADD COLUMN IF NOT EXISTS hr_itsupport_question1 INTEGER DEFAULT 0 CHECK (hr_itsupport_question1 >= 0 AND hr_itsupport_question1 <= 5),
ADD COLUMN IF NOT EXISTS hr_itsupport_question2 INTEGER DEFAULT 0 CHECK (hr_itsupport_question2 >= 0 AND hr_itsupport_question2 <= 5),
ADD COLUMN IF NOT EXISTS hr_itsupport_feedback TEXT;