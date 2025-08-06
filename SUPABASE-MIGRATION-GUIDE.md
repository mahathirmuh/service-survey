# Supabase Migration Guide

This guide will help you migrate your current service-survey application to a new Supabase project while preserving all data and functionality.

## 📋 Prerequisites

- Access to your current Supabase project dashboard
- Admin access to create a new Supabase project
- Supabase CLI installed (already available in your system)
- Node.js environment set up

## 🚀 Step-by-Step Migration Process

### 1. Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Set project name (e.g., "service-survey-new")
5. Set database password (save this securely)
6. Select region (preferably same as current project)
7. Click "Create new project"

### 2. Export Current Database Schema

#### Option A: Using Supabase CLI (Recommended)
```bash
# Login to Supabase CLI
supabase login

# Link to your current project
supabase link --project-ref YOUR_CURRENT_PROJECT_REF

# Generate migration from current database
supabase db dump --schema-only > current_schema.sql

# Export data
supabase db dump --data-only > current_data.sql
```

#### Option B: Manual Export from Dashboard
1. Go to your current Supabase project dashboard
2. Navigate to "SQL Editor"
3. Run this query to get schema:
```sql
-- Export table structures
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public';

-- Get detailed table definitions
\d+ employees
\d+ survey_responses
```

### 3. Update Project Configuration

#### Get New Project Credentials
1. In your new Supabase project dashboard
2. Go to "Settings" → "API"
3. Copy the following:
   - Project URL
   - Project Reference ID
   - `anon` public key
   - `service_role` secret key (if needed)

#### Update Local Configuration

**Update `src/integrations/supabase/client.ts`:**
```typescript
const supabaseUrl = "https://YOUR_NEW_PROJECT_REF.supabase.co";
const supabaseAnonKey = "YOUR_NEW_ANON_KEY";
```

**Update `supabase/config.toml`:**
```toml
project_id = "YOUR_NEW_PROJECT_REF"
```

### 4. Set Up Database Schema in New Project

#### Option A: Using Existing Migration Files
```bash
# Link to new project
supabase link --project-ref YOUR_NEW_PROJECT_REF

# Apply existing migrations
supabase db push
```

#### Option B: Manual Schema Creation
Execute these SQL commands in your new project's SQL Editor:

```sql
-- Create employees table
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_badge_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    section TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any additional columns based on your current schema
-- (Check your existing migrations in supabase/migrations/ folder)
```

### 5. Set Up Row Level Security (RLS) Policies

**Execute in SQL Editor of new project:**
```sql
-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for employees
CREATE POLICY "employees_select_policy" ON employees FOR SELECT USING (true);
CREATE POLICY "employees_insert_policy" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "employees_update_policy" ON employees FOR UPDATE USING (true);
CREATE POLICY "employees_delete_policy" ON employees FOR DELETE USING (true);

-- Enable RLS on survey_responses table
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for survey_responses
CREATE POLICY "survey_responses_select_policy" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "survey_responses_insert_policy" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "survey_responses_update_policy" ON survey_responses FOR UPDATE USING (true);
CREATE POLICY "survey_responses_delete_policy" ON survey_responses FOR DELETE USING (true);
```

### 6. Migrate Data

#### Option A: Export/Import via Dashboard
1. **Export from old project:**
   - Go to "Table Editor"
   - Select each table
   - Export as CSV

2. **Import to new project:**
   - Go to "Table Editor" in new project
   - Use "Insert" → "Import data from CSV"

#### Option B: Using SQL Dumps
```bash
# If you have data dumps from step 2
supabase db reset --linked
psql -h YOUR_NEW_DB_HOST -U postgres -d postgres -f current_data.sql
```

#### Option C: Programmatic Migration
Create a migration script:

```javascript
// migrate-data.js
import { createClient } from '@supabase/supabase-js';

// Old project credentials
const oldSupabase = createClient(
  'https://OLD_PROJECT_REF.supabase.co',
  'OLD_ANON_KEY'
);

// New project credentials
const newSupabase = createClient(
  'https://NEW_PROJECT_REF.supabase.co',
  'NEW_ANON_KEY'
);

async function migrateData() {
  try {
    // Migrate employees
    const { data: employees } = await oldSupabase
      .from('employees')
      .select('*');
    
    if (employees) {
      const { error } = await newSupabase
        .from('employees')
        .insert(employees);
      
      if (error) throw error;
      console.log(`Migrated ${employees.length} employees`);
    }

    // Migrate survey responses
    const { data: responses } = await oldSupabase
      .from('survey_responses')
      .select('*');
    
    if (responses) {
      const { error } = await newSupabase
        .from('survey_responses')
        .insert(responses);
      
      if (error) throw error;
      console.log(`Migrated ${responses.length} survey responses`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData();
```

### 7. Test the Migration

1. **Update your local environment:**
   ```bash
   npm run dev
   ```

2. **Test key functionality:**
   - Admin login
   - Employee management (CRUD operations)
   - Excel import/export
   - Survey form submission
   - Survey results viewing

3. **Verify data integrity:**
   - Check employee count matches
   - Verify survey responses are linked correctly
   - Test all department filters

### 8. Update Production Environment

**If using environment variables:**
```bash
# Update .env file
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
```

**If using Docker:**
```bash
# Rebuild with new configuration
docker-compose down
docker-compose up --build
```

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. RLS Policy Errors**
- Ensure all policies are created with `USING (true)` and `WITH CHECK (true)`
- Verify RLS is enabled on all tables

**2. Foreign Key Constraints**
- Migrate employees table first, then survey_responses
- Ensure UUID references are maintained

**3. Authentication Issues**
- Double-check API keys are correctly updated
- Verify project URL format

**4. Data Type Mismatches**
- Review column definitions in both projects
- Check for any custom types or extensions

## 📝 Post-Migration Checklist

- [ ] All tables created with correct schema
- [ ] RLS policies applied and tested
- [ ] Data migrated completely
- [ ] Application connects to new project
- [ ] Excel import/export works
- [ ] Survey functionality operational
- [ ] Admin dashboard fully functional
- [ ] Production environment updated
- [ ] Old project access revoked (if desired)

## 🚨 Important Notes

1. **Backup First**: Always backup your current data before migration
2. **Test Thoroughly**: Test all functionality in the new environment
3. **Gradual Transition**: Consider running both projects in parallel initially
4. **Monitor Performance**: Check if the new project performs as expected
5. **Update Documentation**: Update any documentation with new project details

## 🆘 Need Help?

If you encounter issues during migration:
1. Check Supabase logs in the new project dashboard
2. Review the migration scripts for any errors
3. Verify all configuration files are updated
4. Test with a small subset of data first

This migration guide ensures a smooth transition to your new Supabase project while maintaining all functionality and data integrity.