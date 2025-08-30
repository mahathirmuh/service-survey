-- Migration to sync survey response levels with current employee levels
-- This fixes the synchronization issue where employee levels were updated but survey responses still have old levels

-- Update survey response levels to match current employee levels
UPDATE survey_responses 
SET level = employees.level
FROM employees 
WHERE survey_responses.id_badge_number = employees.id_badge_number
AND survey_responses.level != employees.level;

-- Add a comment for documentation
COMMENT ON COLUMN survey_responses.level IS 'Employee level at time of survey submission. Should be synced when employee level changes.';