-- Add columns for Human Resources sections
ALTER TABLE public.survey_responses 
ADD COLUMN hr_documentcontrol_question1 INTEGER,
ADD COLUMN hr_documentcontrol_question2 INTEGER,
ADD COLUMN hr_documentcontrol_question3 INTEGER,
ADD COLUMN hr_documentcontrol_feedback TEXT,
ADD COLUMN hr_itsupport_question1 INTEGER,
ADD COLUMN hr_itsupport_question2 INTEGER,
ADD COLUMN hr_itsupport_question3 INTEGER,
ADD COLUMN hr_itsupport_feedback TEXT,

-- Add columns for Environmental sections
ADD COLUMN environmental_team1_question1 INTEGER,
ADD COLUMN environmental_team1_question2 INTEGER,
ADD COLUMN environmental_team1_question3 INTEGER,
ADD COLUMN environmental_team1_feedback TEXT,
ADD COLUMN environmental_team2_question1 INTEGER,
ADD COLUMN environmental_team2_question2 INTEGER,
ADD COLUMN environmental_team2_question3 INTEGER,
ADD COLUMN environmental_team2_feedback TEXT,

-- Add columns for Finance sections
ADD COLUMN finance_finance_question1 INTEGER,
ADD COLUMN finance_finance_question2 INTEGER,
ADD COLUMN finance_finance_question3 INTEGER,
ADD COLUMN finance_finance_feedback TEXT,
ADD COLUMN finance_contract_question1 INTEGER,
ADD COLUMN finance_contract_question2 INTEGER,
ADD COLUMN finance_contract_question3 INTEGER,
ADD COLUMN finance_contract_feedback TEXT,
ADD COLUMN finance_costcontrol_question1 INTEGER,
ADD COLUMN finance_costcontrol_question2 INTEGER,
ADD COLUMN finance_costcontrol_question3 INTEGER,
ADD COLUMN finance_costcontrol_feedback TEXT,

-- Add columns for External Affair sections
ADD COLUMN external_communityrelations_question1 INTEGER,
ADD COLUMN external_communityrelations_question2 INTEGER,
ADD COLUMN external_communityrelations_question3 INTEGER,
ADD COLUMN external_communityrelations_feedback TEXT;