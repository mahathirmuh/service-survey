-- Drop existing question columns that only store one section's answers
ALTER TABLE public.survey_responses
DROP COLUMN IF EXISTS dept1_question1,
DROP COLUMN IF EXISTS dept1_question2,
DROP COLUMN IF EXISTS dept1_question3,
DROP COLUMN IF EXISTS dept1_feedback,
DROP COLUMN IF EXISTS dept2_question1,
DROP COLUMN IF EXISTS dept2_question2,
DROP COLUMN IF EXISTS dept2_question3,
DROP COLUMN IF EXISTS dept2_feedback;

-- Add columns for all sections (5 sections) for both departments
-- Department 1 sections
ALTER TABLE public.survey_responses
ADD COLUMN dept1_section1_question1 integer,
ADD COLUMN dept1_section1_question2 integer,
ADD COLUMN dept1_section1_question3 integer,
ADD COLUMN dept1_section1_feedback text,
ADD COLUMN dept1_section2_question1 integer,
ADD COLUMN dept1_section2_question2 integer,
ADD COLUMN dept1_section2_question3 integer,
ADD COLUMN dept1_section2_feedback text,
ADD COLUMN dept1_section3_question1 integer,
ADD COLUMN dept1_section3_question2 integer,
ADD COLUMN dept1_section3_question3 integer,
ADD COLUMN dept1_section3_feedback text,
ADD COLUMN dept1_section4_question1 integer,
ADD COLUMN dept1_section4_question2 integer,
ADD COLUMN dept1_section4_question3 integer,
ADD COLUMN dept1_section4_feedback text,
ADD COLUMN dept1_section5_question1 integer,
ADD COLUMN dept1_section5_question2 integer,
ADD COLUMN dept1_section5_question3 integer,
ADD COLUMN dept1_section5_feedback text;

-- Department 2 sections
ALTER TABLE public.survey_responses
ADD COLUMN dept2_section1_question1 integer,
ADD COLUMN dept2_section1_question2 integer,
ADD COLUMN dept2_section1_question3 integer,
ADD COLUMN dept2_section1_feedback text,
ADD COLUMN dept2_section2_question1 integer,
ADD COLUMN dept2_section2_question2 integer,
ADD COLUMN dept2_section2_question3 integer,
ADD COLUMN dept2_section2_feedback text,
ADD COLUMN dept2_section3_question1 integer,
ADD COLUMN dept2_section3_question2 integer,
ADD COLUMN dept2_section3_question3 integer,
ADD COLUMN dept2_section3_feedback text,
ADD COLUMN dept2_section4_question1 integer,
ADD COLUMN dept2_section4_question2 integer,
ADD COLUMN dept2_section4_question3 integer,
ADD COLUMN dept2_section4_feedback text,
ADD COLUMN dept2_section5_question1 integer,
ADD COLUMN dept2_section5_question2 integer,
ADD COLUMN dept2_section5_question3 integer,
ADD COLUMN dept2_section5_feedback text;