-- Migration to sync employee status with actual survey submissions
-- This fixes any existing data where employees have submitted surveys but status is still 'Not Submitted'

-- Update employee status to 'Submitted' for employees who have survey responses
UPDATE employees 
SET status = 'Submitted'
WHERE id_badge_number IN (
    SELECT DISTINCT id_badge_number 
    FROM survey_responses
)
AND status = 'Not Submitted';

-- Update employee status to 'Not Submitted' for employees who don't have survey responses
UPDATE employees 
SET status = 'Not Submitted'
WHERE id_badge_number NOT IN (
    SELECT DISTINCT id_badge_number 
    FROM survey_responses
    WHERE id_badge_number IS NOT NULL
)
AND status = 'Submitted';

-- Add a comment for documentation
COMMENT ON COLUMN employees.status IS 'Employee survey submission status: Submitted or Not Submitted. Automatically updated when surveys are submitted.';