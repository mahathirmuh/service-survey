-- Add section columns to survey_responses table
ALTER TABLE public.survey_responses
ADD COLUMN dept1_section TEXT,
ADD COLUMN dept2_section TEXT;