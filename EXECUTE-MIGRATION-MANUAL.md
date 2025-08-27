# Manual Migration Execution Guide

Since automated migration attempts have failed due to connection limitations, please follow these manual steps to execute the migration:

## Step 1: Access Supabase SQL Editor

1. Log in to your Supabase account at https://supabase.com/dashboard
2. Navigate to the "Service Survey App" project
3. Click on "SQL Editor" in the left sidebar

## Step 2: Execute the SQL Commands

Copy and paste the following SQL commands into the SQL Editor and click "Run":

```sql
-- Add all environmental, external, HR, and SCM columns
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT,
ADD COLUMN IF NOT EXISTS environmental_management_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_feedback TEXT,
ADD COLUMN IF NOT EXISTS environmental_monitoring_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_monitoring_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_monitoring_feedback TEXT,
ADD COLUMN IF NOT EXISTS environmental_study_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_study_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_study_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_assetprotection_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_assetprotection_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_assetprotection_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_govrel_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_govrel_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_govrel_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_communityrelations_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communityrelations_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communityrelations_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_legal_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_legal_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_legal_feedback TEXT,
ADD COLUMN IF NOT EXISTS external_communications_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communications_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS external_communications_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_comben_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_comben_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_comben_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_recruitment_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_recruitment_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_recruitment_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_training_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_training_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_training_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_performance_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_performance_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_performance_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_ir_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_ir_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_ir_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_documentcontrol_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_documentcontrol_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_documentcontrol_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_itsupport_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itsupport_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itsupport_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_itfield_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itfield_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_itfield_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_siteservice_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_siteservice_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_siteservice_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_peopledev_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_peopledev_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_peopledev_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_translator_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_translator_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_translator_feedback TEXT,
ADD COLUMN IF NOT EXISTS hr_talentacquisition_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_talentacquisition_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hr_talentacquisition_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_inventory_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_inventory_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_inventory_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_procurement_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_procurement_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_procurement_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_logistic_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_logistic_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_logistic_feedback TEXT,
ADD COLUMN IF NOT EXISTS scm_warehouse_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_warehouse_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scm_warehouse_feedback TEXT;

-- Verify columns were added
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name = 'survey_responses' AND
  (column_name LIKE 'environmental_%' OR column_name LIKE 'external_%' OR column_name LIKE 'hr_%');
```

## Step 3: Verify SQL Execution

After running the SQL commands, you should see a result set showing the newly added columns:

| column_name | data_type |
|-------------|----------|
| environmental_audit_question1 | integer |
| environmental_audit_question2 | integer |
| environmental_audit_feedback | text |
| environmental_management_question1 | integer |
| environmental_management_question2 | integer |
| environmental_management_feedback | text |
| environmental_monitoring_question1 | integer |
| environmental_monitoring_question2 | integer |
| environmental_monitoring_feedback | text |
| environmental_study_question1 | integer |
| environmental_study_question2 | integer |
| environmental_study_feedback | text |

If you see these columns in the result set, the migration was successful.

## Step 4: Import Data

After successfully adding the columns, run the import script to import the data:

```bash
node import-to-new-project.js
```

You should see output indicating that both employees and survey responses were imported successfully.

## Step 5: Verify Data

1. In the Supabase Dashboard, navigate to "Table Editor"
2. Select the "survey_responses" table
3. Verify that the data has been imported correctly and the new columns are present

## Step 6: Test Application

Test the application to ensure it works correctly with the migrated data.

## Troubleshooting

If you encounter any issues during the migration process, please check the following:

### Column Not Found Error

If you see an error like `Could not find the 'environmental_audit_feedback' column of 'survey_responses' in the schema cache`, it means the columns were not added successfully. Try the following:

1. Refresh the Supabase Dashboard
2. Re-run the SQL commands in the SQL Editor
3. Check for any error messages in the SQL Editor

### Import Script Fails

If the import script fails, check the error message for details. Common issues include:

- Schema cache not updated (wait a few minutes and try again)
- Network connectivity issues
- Permission issues

## Admin Credentials

Username: postgres  
Password: T$1ngsh4n@24

---

**Note:** If you continue to experience issues, you may need to contact Supabase support or check the Supabase documentation for more information on executing SQL commands and managing schema changes.