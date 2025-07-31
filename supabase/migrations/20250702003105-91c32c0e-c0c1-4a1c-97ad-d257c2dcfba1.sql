-- Create the survey responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  id_badge_number TEXT NOT NULL,
  department TEXT NOT NULL,
  
  -- Department 1 questionnaire responses (1-5 scale)
  dept1_question1 INTEGER CHECK (dept1_question1 >= 1 AND dept1_question1 <= 5),
  dept1_question2 INTEGER CHECK (dept1_question2 >= 1 AND dept1_question2 <= 5),
  dept1_question3 INTEGER CHECK (dept1_question3 >= 1 AND dept1_question3 <= 5),
  dept1_feedback TEXT,
  
  -- Department 2 questionnaire responses (1-5 scale)
  dept2_question1 INTEGER CHECK (dept2_question1 >= 1 AND dept2_question1 <= 5),
  dept2_question2 INTEGER CHECK (dept2_question2 >= 1 AND dept2_question2 <= 5),
  dept2_question3 INTEGER CHECK (dept2_question3 >= 1 AND dept2_question3 <= 5),
  dept2_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (since no authentication)
CREATE POLICY "Anyone can insert survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading all responses (for admin purposes)
CREATE POLICY "Anyone can view survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_survey_responses_updated_at
BEFORE UPDATE ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();