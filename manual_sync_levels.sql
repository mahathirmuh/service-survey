-- Manual sync script to update survey response levels to match current employee levels
-- This fixes the synchronization issue where employee levels were updated but survey responses still have old levels

-- Update survey response levels to match current employee levels
UPDATE survey_responses 
SET level = employees.level
FROM employees 
WHERE survey_responses.id_badge_number = employees.id_badge_number
AND survey_responses.level != employees.level;

-- Show the results of the sync
SELECT 
    sr.id_badge_number,
    sr.name,
    sr.department,
    sr.level as survey_response_level,
    e.level as employee_level,
    CASE 
        WHEN sr.level = e.level THEN 'SYNCED' 
        ELSE 'MISMATCH' 
    END as sync_status
FROM survey_responses sr
JOIN employees e ON sr.id_badge_number = e.id_badge_number
ORDER BY sr.name;