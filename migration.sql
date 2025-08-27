-- Migration script for Supabase project data
-- Generated on 2025-08-22T09:52:21.506Z

-- Sample employees data
INSERT INTO public.employees (id_badge_number, name, department, status) VALUES
('MTI001', 'John Doe', 'IT Department', 'Not Submitted'),
('MTI002', 'Jane Smith', 'HR Department', 'Not Submitted'),
('MTI003', 'Bob Johnson', 'Environmental Department', 'Not Submitted'),
('MTI004', 'Alice Brown', 'Finance Department', 'Not Submitted'),
('MTI005', 'Charlie Wilson', 'External Affairs Department', 'Not Submitted')
ON CONFLICT (id_badge_number) DO NOTHING;

-- Verify the data
SELECT COUNT(*) as employee_count FROM public.employees;
SELECT * FROM public.employees ORDER BY created_at DESC LIMIT 10;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('employees', 'survey_responses');
