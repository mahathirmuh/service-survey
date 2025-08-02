-- MSSQL Database Schema for Survey Application
-- Equivalent to Supabase PostgreSQL schema

-- Create database (uncomment if needed)
-- CREATE DATABASE SurveyApp;
-- USE SurveyApp;

-- =====================================================
-- 1. Create Employees Table
-- =====================================================
CREATE TABLE employees (
    id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    id_badge_number NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    department NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create index for performance
CREATE INDEX IX_employees_id_badge_number ON employees(id_badge_number);
CREATE INDEX IX_employees_department ON employees(department);

-- =====================================================
-- 2. Create Survey Responses Table
-- =====================================================
CREATE TABLE survey_responses (
    id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    id_badge_number NVARCHAR(50) NOT NULL,
    department NVARCHAR(255) NOT NULL,
    
    -- Section information
    dept1_section NVARCHAR(255),
    dept2_section NVARCHAR(255),
    
    -- Department 1 sections (5 sections)
    dept1_section1_question1 INT CHECK (dept1_section1_question1 >= 1 AND dept1_section1_question1 <= 5),
    dept1_section1_question2 INT CHECK (dept1_section1_question2 >= 1 AND dept1_section1_question2 <= 5),
    dept1_section1_question3 INT CHECK (dept1_section1_question3 >= 1 AND dept1_section1_question3 <= 5),
    dept1_section1_feedback NTEXT,
    
    dept1_section2_question1 INT CHECK (dept1_section2_question1 >= 1 AND dept1_section2_question1 <= 5),
    dept1_section2_question2 INT CHECK (dept1_section2_question2 >= 1 AND dept1_section2_question2 <= 5),
    dept1_section2_question3 INT CHECK (dept1_section2_question3 >= 1 AND dept1_section2_question3 <= 5),
    dept1_section2_feedback NTEXT,
    
    dept1_section3_question1 INT CHECK (dept1_section3_question1 >= 1 AND dept1_section3_question1 <= 5),
    dept1_section3_question2 INT CHECK (dept1_section3_question2 >= 1 AND dept1_section3_question2 <= 5),
    dept1_section3_question3 INT CHECK (dept1_section3_question3 >= 1 AND dept1_section3_question3 <= 5),
    dept1_section3_feedback NTEXT,
    
    dept1_section4_question1 INT CHECK (dept1_section4_question1 >= 1 AND dept1_section4_question1 <= 5),
    dept1_section4_question2 INT CHECK (dept1_section4_question2 >= 1 AND dept1_section4_question2 <= 5),
    dept1_section4_question3 INT CHECK (dept1_section4_question3 >= 1 AND dept1_section4_question3 <= 5),
    dept1_section4_feedback NTEXT,
    
    dept1_section5_question1 INT CHECK (dept1_section5_question1 >= 1 AND dept1_section5_question1 <= 5),
    dept1_section5_question2 INT CHECK (dept1_section5_question2 >= 1 AND dept1_section5_question2 <= 5),
    dept1_section5_question3 INT CHECK (dept1_section5_question3 >= 1 AND dept1_section5_question3 <= 5),
    dept1_section5_feedback NTEXT,
    
    -- Department 2 sections (5 sections)
    dept2_section1_question1 INT CHECK (dept2_section1_question1 >= 1 AND dept2_section1_question1 <= 5),
    dept2_section1_question2 INT CHECK (dept2_section1_question2 >= 1 AND dept2_section1_question2 <= 5),
    dept2_section1_question3 INT CHECK (dept2_section1_question3 >= 1 AND dept2_section1_question3 <= 5),
    dept2_section1_feedback NTEXT,
    
    dept2_section2_question1 INT CHECK (dept2_section2_question1 >= 1 AND dept2_section2_question1 <= 5),
    dept2_section2_question2 INT CHECK (dept2_section2_question2 >= 1 AND dept2_section2_question2 <= 5),
    dept2_section2_question3 INT CHECK (dept2_section2_question3 >= 1 AND dept2_section2_question3 <= 5),
    dept2_section2_feedback NTEXT,
    
    dept2_section3_question1 INT CHECK (dept2_section3_question1 >= 1 AND dept2_section3_question1 <= 5),
    dept2_section3_question2 INT CHECK (dept2_section3_question2 >= 1 AND dept2_section3_question2 <= 5),
    dept2_section3_question3 INT CHECK (dept2_section3_question3 >= 1 AND dept2_section3_question3 <= 5),
    dept2_section3_feedback NTEXT,
    
    dept2_section4_question1 INT CHECK (dept2_section4_question1 >= 1 AND dept2_section4_question1 <= 5),
    dept2_section4_question2 INT CHECK (dept2_section4_question2 >= 1 AND dept2_section4_question2 <= 5),
    dept2_section4_question3 INT CHECK (dept2_section4_question3 >= 1 AND dept2_section4_question3 <= 5),
    dept2_section4_feedback NTEXT,
    
    dept2_section5_question1 INT CHECK (dept2_section5_question1 >= 1 AND dept2_section5_question1 <= 5),
    dept2_section5_question2 INT CHECK (dept2_section5_question2 >= 1 AND dept2_section5_question2 <= 5),
    dept2_section5_question3 INT CHECK (dept2_section5_question3 >= 1 AND dept2_section5_question3 <= 5),
    dept2_section5_feedback NTEXT,
    
    -- Human Resources sections
    hr_documentcontrol_question1 INT CHECK (hr_documentcontrol_question1 >= 1 AND hr_documentcontrol_question1 <= 5),
    hr_documentcontrol_question2 INT CHECK (hr_documentcontrol_question2 >= 1 AND hr_documentcontrol_question2 <= 5),
    hr_documentcontrol_question3 INT CHECK (hr_documentcontrol_question3 >= 1 AND hr_documentcontrol_question3 <= 5),
    hr_documentcontrol_feedback NTEXT,
    
    hr_itsupport_question1 INT CHECK (hr_itsupport_question1 >= 1 AND hr_itsupport_question1 <= 5),
    hr_itsupport_question2 INT CHECK (hr_itsupport_question2 >= 1 AND hr_itsupport_question2 <= 5),
    hr_itsupport_question3 INT CHECK (hr_itsupport_question3 >= 1 AND hr_itsupport_question3 <= 5),
    hr_itsupport_feedback NTEXT,
    
    -- Environmental sections
    environmental_team1_question1 INT CHECK (environmental_team1_question1 >= 1 AND environmental_team1_question1 <= 5),
    environmental_team1_question2 INT CHECK (environmental_team1_question2 >= 1 AND environmental_team1_question2 <= 5),
    environmental_team1_question3 INT CHECK (environmental_team1_question3 >= 1 AND environmental_team1_question3 <= 5),
    environmental_team1_feedback NTEXT,
    
    environmental_team2_question1 INT CHECK (environmental_team2_question1 >= 1 AND environmental_team2_question1 <= 5),
    environmental_team2_question2 INT CHECK (environmental_team2_question2 >= 1 AND environmental_team2_question2 <= 5),
    environmental_team2_question3 INT CHECK (environmental_team2_question3 >= 1 AND environmental_team2_question3 <= 5),
    environmental_team2_feedback NTEXT,
    
    -- Finance sections
    finance_finance_question1 INT CHECK (finance_finance_question1 >= 1 AND finance_finance_question1 <= 5),
    finance_finance_question2 INT CHECK (finance_finance_question2 >= 1 AND finance_finance_question2 <= 5),
    finance_finance_question3 INT CHECK (finance_finance_question3 >= 1 AND finance_finance_question3 <= 5),
    finance_finance_feedback NTEXT,
    
    finance_contract_question1 INT CHECK (finance_contract_question1 >= 1 AND finance_contract_question1 <= 5),
    finance_contract_question2 INT CHECK (finance_contract_question2 >= 1 AND finance_contract_question2 <= 5),
    finance_contract_question3 INT CHECK (finance_contract_question3 >= 1 AND finance_contract_question3 <= 5),
    finance_contract_feedback NTEXT,
    
    finance_costcontrol_question1 INT CHECK (finance_costcontrol_question1 >= 1 AND finance_costcontrol_question1 <= 5),
    finance_costcontrol_question2 INT CHECK (finance_costcontrol_question2 >= 1 AND finance_costcontrol_question2 <= 5),
    finance_costcontrol_question3 INT CHECK (finance_costcontrol_question3 >= 1 AND finance_costcontrol_question3 <= 5),
    finance_costcontrol_feedback NTEXT,
    
    -- External Affair sections
    external_communityrelations_question1 INT CHECK (external_communityrelations_question1 >= 1 AND external_communityrelations_question1 <= 5),
    external_communityrelations_question2 INT CHECK (external_communityrelations_question2 >= 1 AND external_communityrelations_question2 <= 5),
    external_communityrelations_question3 INT CHECK (external_communityrelations_question3 >= 1 AND external_communityrelations_question3 <= 5),
    external_communityrelations_feedback NTEXT,
    
    -- Additional External Affair sections (based on migration)
    external_assetprotection_question1 INT DEFAULT 0 CHECK (external_assetprotection_question1 >= 0 AND external_assetprotection_question1 <= 5),
    external_assetprotection_question2 INT DEFAULT 0 CHECK (external_assetprotection_question2 >= 0 AND external_assetprotection_question2 <= 5),
    external_govrel_question1 INT DEFAULT 0 CHECK (external_govrel_question1 >= 0 AND external_govrel_question1 <= 5),
    external_govrel_question2 INT DEFAULT 0 CHECK (external_govrel_question2 >= 0 AND external_govrel_question2 <= 5),
    
    -- OHS sections
    ohs_training_question1 INT DEFAULT 0 CHECK (ohs_training_question1 >= 0 AND ohs_training_question1 <= 5),
    ohs_training_question2 INT DEFAULT 0 CHECK (ohs_training_question2 >= 0 AND ohs_training_question2 <= 5),
    
    -- SCM sections (Note: Inventory and Procurement were removed, but keeping for data integrity)
    scm_inventory_question1 INT DEFAULT 0 CHECK (scm_inventory_question1 >= 0 AND scm_inventory_question1 <= 5),
    scm_inventory_question2 INT DEFAULT 0 CHECK (scm_inventory_question2 >= 0 AND scm_inventory_question2 <= 5),
    scm_procurement_question1 INT DEFAULT 0 CHECK (scm_procurement_question1 >= 0 AND scm_procurement_question1 <= 5),
    scm_procurement_question2 INT DEFAULT 0 CHECK (scm_procurement_question2 >= 0 AND scm_procurement_question2 <= 5),
    
    -- Timestamps
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create indexes for performance
CREATE INDEX IX_survey_responses_id_badge_number ON survey_responses(id_badge_number);
CREATE INDEX IX_survey_responses_department ON survey_responses(department);
CREATE INDEX IX_survey_responses_created_at ON survey_responses(created_at);

-- =====================================================
-- 3. Create Triggers for Automatic Timestamp Updates
-- =====================================================

-- Trigger for employees table
CREATE TRIGGER tr_employees_updated_at
ON employees
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE employees 
    SET updated_at = GETDATE()
    FROM employees e
    INNER JOIN inserted i ON e.id = i.id;
END;

-- Trigger for survey_responses table
CREATE TRIGGER tr_survey_responses_updated_at
ON survey_responses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE survey_responses 
    SET updated_at = GETDATE()
    FROM survey_responses sr
    INNER JOIN inserted i ON sr.id = i.id;
END;

-- =====================================================
-- 4. Insert Sample Employee Data
-- =====================================================
INSERT INTO employees (id_badge_number, name, department) VALUES 
('MTI001', 'John Doe', 'Environmental Department'),
('MTI002', 'Jane Smith', 'Finance Department'),
('MTI003', 'Mike Johnson', 'Human Resources'),
('MTI004', 'Sarah Wilson', 'External Affair Department'),
('MTI005', 'David Brown', 'Environmental Department'),
('MTI006', 'Alice Cooper', 'Supply Chain Management'),
('MTI007', 'Bob Wilson', 'Personal Data'),
('MTI008', 'Carol Davis', 'ICT Department'),
('MTI009', 'Daniel Lee', 'Human Resources'),
('MTI010', 'Eva Martinez', 'Environmental Department');

-- =====================================================
-- 5. Create Views for Reporting (Optional)
-- =====================================================

-- View for survey response summary
CREATE VIEW vw_survey_summary AS
SELECT 
    sr.id,
    sr.name,
    sr.id_badge_number,
    sr.department,
    sr.dept1_section,
    sr.dept2_section,
    sr.created_at,
    e.name as employee_name,
    e.department as employee_department
FROM survey_responses sr
LEFT JOIN employees e ON sr.id_badge_number = e.id_badge_number;

-- View for response statistics
CREATE VIEW vw_response_statistics AS
SELECT 
    department,
    COUNT(*) as total_responses,
    AVG(CAST(dept1_section1_question1 as FLOAT)) as avg_dept1_q1,
    AVG(CAST(dept1_section1_question2 as FLOAT)) as avg_dept1_q2,
    AVG(CAST(dept1_section1_question3 as FLOAT)) as avg_dept1_q3
FROM survey_responses
WHERE dept1_section1_question1 IS NOT NULL
GROUP BY department;

-- =====================================================
-- 6. Create Stored Procedures (Optional)
-- =====================================================

-- Procedure to get employee by badge number
CREATE PROCEDURE sp_GetEmployeeByBadge
    @BadgeNumber NVARCHAR(50)
AS
BEGIN
    SELECT id, id_badge_number, name, department, created_at, updated_at
    FROM employees
    WHERE id_badge_number = @BadgeNumber;
END;

-- Procedure to insert survey response
CREATE PROCEDURE sp_InsertSurveyResponse
    @Name NVARCHAR(255),
    @IdBadgeNumber NVARCHAR(50),
    @Department NVARCHAR(255),
    @Dept1Section NVARCHAR(255) = NULL,
    @Dept2Section NVARCHAR(255) = NULL
AS
BEGIN
    INSERT INTO survey_responses (name, id_badge_number, department, dept1_section, dept2_section)
    VALUES (@Name, @IdBadgeNumber, @Department, @Dept1Section, @Dept2Section);
    
    SELECT SCOPE_IDENTITY() as NewId;
END;

-- =====================================================
-- 7. Grant Permissions (Adjust as needed)
-- =====================================================

-- Example permissions (uncomment and modify as needed)
-- GRANT SELECT, INSERT, UPDATE ON employees TO [YourAppUser];
-- GRANT SELECT, INSERT, UPDATE ON survey_responses TO [YourAppUser];
-- GRANT SELECT ON vw_survey_summary TO [YourAppUser];
-- GRANT SELECT ON vw_response_statistics TO [YourAppUser];
-- GRANT EXECUTE ON sp_GetEmployeeByBadge TO [YourAppUser];
-- GRANT EXECUTE ON sp_InsertSurveyResponse TO [YourAppUser];

PRINT 'MSSQL Survey Database Schema created successfully!';
PRINT 'Tables created: employees, survey_responses';
PRINT 'Views created: vw_survey_summary, vw_response_statistics';
PRINT 'Stored procedures created: sp_GetEmployeeByBadge, sp_InsertSurveyResponse';
PRINT 'Sample employee data inserted.';