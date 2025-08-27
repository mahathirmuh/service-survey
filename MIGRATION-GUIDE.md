# Service Survey Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Service Survey application from the old Supabase account to the new Supabase project. The migration process involves adding missing columns to the database schema and importing data from the old project.

## Prerequisites

- Access to the Supabase dashboard for the new project
- The SQL Editor in Supabase
- Node.js installed locally

## Migration Steps

### 1. Add Missing Columns to the Database Schema

The migration requires adding environmental audit columns to the `survey_responses` table. These columns are missing in the new Supabase project and must be added manually.

1. Log in to the [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your new project: `uwbqdiwuczhorzdzdlqp`
3. Open the SQL Editor
4. Copy and paste the following SQL script:

```sql
-- Add environmental_audit columns
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;

-- Verify columns were added
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' AND 
  table_name = 'survey_responses' AND
  column_name LIKE 'environmental_audit%';
```

5. Click "Run" to execute the SQL script
6. Verify that the query results show the three new columns

### 2. Import Data from Old to New Supabase Project

After adding the missing columns, you can import the data from the old Supabase project.

1. Open a terminal in the project directory
2. Run the import script:

```bash
node import-to-new-project.js
```

3. The script will:
   - Check the schema of the new Supabase project
   - Import employee data (if not already present)
   - Import survey response data
   - Generate a migration SQL script for verification

4. Verify the output to ensure all data was imported successfully

### 3. Verify Data in Supabase Dashboard

1. In the Supabase Dashboard, navigate to the "Table Editor"
2. Check the `employees` table to verify all employee records are present
3. Check the `survey_responses` table to verify all survey responses are present
4. Verify that the environmental audit columns contain the correct data

### 4. Test the Application

1. Start the application locally:

```bash
npm run dev
```

2. Test the following functionality:
   - User login
   - Survey form submission
   - Admin dashboard access
   - Data visualization
   - Filtering and searching

## Troubleshooting

### Missing Column Error

If you encounter a "Missing Column" error during data import, ensure you've correctly executed the SQL script to add the missing columns. Verify the columns exist in the Supabase Table Editor before running the import script again.

### Import Script Failure

If the import script fails:

1. Check the error message for specific details
2. Verify your Supabase credentials in the client configuration
3. Ensure the database schema matches the expected structure
4. Check network connectivity to the Supabase API

### Data Verification Issues

If data appears to be missing or incorrect after import:

1. Check the migration SQL script generated during import
2. Verify the data in the source JSON files
3. Check for any error messages during the import process
4. Consider running a manual SQL query to verify the data

## Conclusion

After completing these steps, your Service Survey application should be fully migrated to the new Supabase project with all data intact. If you encounter any issues not covered in this guide, please refer to the migration journal or contact the development team for assistance.

---

**Note:** This migration guide was last updated on August 23, 2025.