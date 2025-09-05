-- Add some managerial employees and fix level values

-- First, update existing employees to have proper level values
UPDATE public.employees 
SET level = 'Non Managerial' 
WHERE level = 'Non-Managerial' OR level IS NULL;

-- Add some managerial employees for testing
INSERT INTO public.employees (id_badge_number, name, department, level, email) VALUES 
('MTI230136', 'Adhi Surahman', 'Human Resources', 'Managerial', 'adhi.surahman@merdekabattery.com'),
('MTI240266', 'Ardian', 'External Affair', 'Managerial', 'ardian@merdekabattery.com'),
('MTI006', 'Ahmad Manager', 'Environmental Department', 'Managerial', 'ahmad.manager@merdekabattery.com'),
('MTI007', 'Lisa Director', 'Finance Department', 'Managerial', 'lisa.director@merdekabattery.com')
ON CONFLICT (id_badge_number) DO UPDATE SET 
  level = EXCLUDED.level,
  email = EXCLUDED.email;

-- Update any existing survey responses to use correct level format
UPDATE public.survey_responses 
SET level = 'Non Managerial' 
WHERE level = 'Non-Managerial';

UPDATE public.survey_responses 
SET level = 'Managerial' 
WHERE level = 'Managerial';