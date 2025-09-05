-- Fix Analytics Mismatch: Add missing employee_id to Ardian's survey response
-- Run this SQL in Supabase SQL Editor to bypass RLS policies

-- Step 1: Verify the current state
SELECT 
    sr.id as response_id,
    sr.name,
    sr.id_badge_number,
    sr.employee_id,
    sr.level,
    sr.department,
    e.id as employee_table_id,
    e.name as employee_name
FROM public.survey_responses sr
LEFT JOIN public.employees e ON sr.id_badge_number = e.id_badge_number
WHERE sr.id_badge_number = 'MTI240266';

-- Step 2: Update Ardian's survey response with the correct employee_id
UPDATE public.survey_responses 
SET employee_id = '3670c920-e378-4680-9020-d18dd0241aea'
WHERE id = 'c6281843-8316-4154-8eb5-6f97c79ea435'
AND id_badge_number = 'MTI240266';

-- Step 3: Verify the fix
SELECT 
    sr.id as response_id,
    sr.name,
    sr.id_badge_number,
    sr.employee_id,
    sr.level,
    sr.department
FROM public.survey_responses sr
WHERE sr.id_badge_number = 'MTI240266';

-- Step 4: Test the Analytics query to confirm it now works
SELECT 
    sr.id,
    sr.name,
    sr.id_badge_number,
    sr.level as survey_level,
    sr.department as survey_department,
    sr.employee_id,
    e.level as employee_level,
    e.department as employee_department,
    e.name as employee_name
FROM public.survey_responses sr
INNER JOIN public.employees e ON sr.employee_id = e.id
WHERE e.level = 'Managerial'
ORDER BY sr.created_at DESC;

-- Expected result: Should show 2 Managerial responses (Ardian + Mahathir Muhammad)