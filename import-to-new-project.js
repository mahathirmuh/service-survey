// Data Import Script for New Supabase Project
// This script helps import data to the new Supabase project

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New Supabase project credentials
const NEW_SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize new Supabase client
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

// Sample data directory
const dataDir = path.join(__dirname, 'sample-data');

// Ensure sample data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Function to check schema and tables
async function checkSchema() {
  try {
    console.log('🔍 Checking new Supabase project schema...');
    console.log('📍 URL:', NEW_SUPABASE_URL);
    
    // Check if employees table exists
    const { data: employees, error: empError } = await newSupabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (empError) {
      console.log('❌ Employees table error:', empError.message);
    } else {
      console.log('✅ Employees table accessible');
    }
    
    // Check if survey_responses table exists
    const { data: surveys, error: surveyError } = await newSupabase
      .from('survey_responses')
      .select('*')
      .limit(1);
    
    if (surveyError) {
      console.log('❌ Survey responses table error:', surveyError.message);
    } else {
      console.log('✅ Survey responses table accessible');
    }
    
    return !empError && !surveyError;
  } catch (err) {
    console.error('❌ Error checking schema:', err);
    return false;
  }
}

// Function to create sample employees data
function createSampleEmployeesData() {
  const sampleEmployees = [
    {
      id_badge_number: 'MTI001',
      name: 'John Doe',
      department: 'IT Department',
      status: 'Not Submitted'
    },
    {
      id_badge_number: 'MTI002',
      name: 'Jane Smith',
      department: 'HR Department',
      status: 'Not Submitted'
    },
    {
      id_badge_number: 'MTI003',
      name: 'Bob Johnson',
      department: 'Environmental Department',
      status: 'Not Submitted'
    },
    {
      id_badge_number: 'MTI004',
      name: 'Alice Brown',
      department: 'Finance Department',
      status: 'Not Submitted'
    },
    {
      id_badge_number: 'MTI005',
      name: 'Charlie Wilson',
      department: 'External Affairs Department',
      status: 'Not Submitted'
    }
  ];
  
  const filePath = path.join(dataDir, 'sample_employees.json');
  fs.writeFileSync(filePath, JSON.stringify(sampleEmployees, null, 2));
  console.log(`📝 Created sample employees data: ${filePath}`);
  return sampleEmployees;
}

// Function to import employees data
async function importEmployees(employeesData = null) {
  try {
    console.log('📊 Importing employees data...');
    
    let employees = employeesData;
    if (!employees) {
      // Try to read from exported data first
      const exportedFilePath = path.join(__dirname, 'data-export', 'employees.json');
      if (fs.existsSync(exportedFilePath)) {
        employees = JSON.parse(fs.readFileSync(exportedFilePath, 'utf8'));
        console.log(`📁 Loaded ${employees.length} employees from exported data`);
      } else {
        // Try to read from sample data
        const filePath = path.join(dataDir, 'employees.json');
        if (fs.existsSync(filePath)) {
          employees = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`📁 Loaded ${employees.length} employees from ${filePath}`);
        } else {
          // Create sample data
          employees = createSampleEmployeesData();
          console.log(`📝 Using ${employees.length} sample employees`);
        }
      }
    }
    
    if (!employees || employees.length === 0) {
      console.log('⚠️ No employees data to import');
      return false;
    }
    
    // Check for existing employees
    const badgeNumbers = employees.map(emp => emp.id_badge_number);
    const { data: existing } = await newSupabase
      .from('employees')
      .select('id_badge_number')
      .in('id_badge_number', badgeNumbers);
    
    const existingBadges = new Set(existing?.map(emp => emp.id_badge_number) || []);
    const newEmployees = employees.filter(emp => !existingBadges.has(emp.id_badge_number));
    
    if (newEmployees.length === 0) {
      console.log('ℹ️ All employees already exist in the database');
      return true;
    }
    
    console.log(`📥 Inserting ${newEmployees.length} new employees...`);
    
    const { data, error } = await newSupabase
      .from('employees')
      .insert(newEmployees)
      .select();
    
    if (error) {
      console.error('❌ Error inserting employees:', error);
      return false;
    }
    
    console.log(`✅ Successfully imported ${data.length} employees`);
    return true;
  } catch (err) {
    console.error('❌ Error importing employees:', err);
    return false;
  }
}

// Function to import survey responses data
async function importSurveyResponses() {
  try {
    console.log('📊 Importing survey responses data...');
    
    // Try to read from exported data
    const exportedFilePath = path.join(__dirname, 'data-export', 'survey_responses.json');
    if (!fs.existsSync(exportedFilePath)) {
      console.log('⚠️ No exported survey responses data found');
      return false;
    }
    
    const surveyResponses = JSON.parse(fs.readFileSync(exportedFilePath, 'utf8'));
    console.log(`📁 Loaded ${surveyResponses.length} survey responses from exported data`);
    
    if (surveyResponses.length === 0) {
      console.log('ℹ️ No survey responses to import');
      return true;
    }
    
    // Check for existing responses
    const badgeNumbers = surveyResponses.map(resp => resp.id_badge_number);
    const { data: existing } = await newSupabase
      .from('survey_responses')
      .select('id_badge_number')
      .in('id_badge_number', badgeNumbers);
    
    const existingBadges = new Set(existing?.map(resp => resp.id_badge_number) || []);
    const newResponses = surveyResponses.filter(resp => !existingBadges.has(resp.id_badge_number));
    
    if (newResponses.length === 0) {
      console.log('ℹ️ All survey responses already exist in the database');
      return true;
    }
    
    console.log(`📥 Inserting ${newResponses.length} new survey responses...`);
    
    // Remove the 'id' field from responses as it will be auto-generated
    const responsesToInsert = newResponses.map(({ id, ...rest }) => rest);
    
    const { data, error } = await newSupabase
      .from('survey_responses')
      .insert(responsesToInsert)
      .select();
    
    if (error) {
      console.error('❌ Error inserting survey responses:', error);
      return false;
    }
    
    console.log(`✅ Successfully imported ${data.length} survey responses`);
    return true;
  } catch (err) {
    console.error('❌ Error importing survey responses:', err);
    return false;
  }
}

// Function to generate SQL migration script
function generateMigrationSQL() {
  try {
    console.log('📝 Generating SQL migration script...');
    
    const sqlContent = `-- Migration script for Supabase project data
-- Generated on ${new Date().toISOString()}

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
`;
    
    const filePath = path.join(__dirname, 'migration.sql');
    fs.writeFileSync(filePath, sqlContent);
    
    console.log(`✅ Generated migration SQL: ${filePath}`);
    return true;
  } catch (err) {
    console.error('❌ Error generating migration SQL:', err);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting data import to new Supabase project...');
  console.log('');
  
  // Check schema
  const schemaOk = await checkSchema();
  if (!schemaOk) {
    console.log('❌ Schema check failed. Please ensure tables are created.');
    return;
  }
  
  console.log('');
  
  // Import employees
  const employeesSuccess = await importEmployees();
  
  console.log('');
  
  // Import survey responses
  const surveySuccess = await importSurveyResponses();
  
  console.log('');
  
  // Generate migration SQL
  generateMigrationSQL();
  
  console.log('');
  
  if (employeesSuccess || surveySuccess) {
    console.log('🎉 Data import completed!');
    console.log('📋 Summary:');
    console.log(`   - Employees import: ${employeesSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`   - Survey responses import: ${surveySuccess ? '✅ Success' : '❌ Failed'}`);
    console.log('📋 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Test application functionality');
    console.log('   3. Check data integrity and completeness');
  } else {
    console.log('❌ Data import failed. Please check the errors above.');
    console.log('💡 You can also run the generated migration.sql in Supabase dashboard');
  }
}

// Run if executed directly
const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution = process.argv[1] === scriptPath;

if (isDirectExecution) {
  main();
}

export {
  checkSchema,
  importEmployees,
  generateMigrationSQL,
  main
};