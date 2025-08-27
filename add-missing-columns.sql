-- SQL script to add missing environmental_audit columns
-- Run this in the Supabase SQL Editor

-- Add environmental_audit columns
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;

-- Verify columns were added
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name = 'survey_responses' AND
  column_name LIKE 'environmental_audit%';