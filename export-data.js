// Data Export Script for Old Supabase Project
// This script exports data from the old Supabase project for migration

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Old Supabase project credentials (from commit 99366bf)
const OLD_SUPABASE_URL = 'https://tbuuysrvoxhsgcuwmilk.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidXV5c3J2b3hoc2djdXdtaWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTM4MjgsImV4cCI6MjA2Njk4OTgyOH0.bsR1gq8CWpOP_ceYgMGi_IksSltuvSkPMO0VpK_rBNM';

// Initialize old Supabase client
const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);

// Export directory
const exportDir = path.join(__dirname, 'data-export');

// Ensure export directory exists
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

// Function to export employees data
async function exportEmployees() {
  try {
    console.log('🔍 Connecting to old Supabase project...');
    console.log('📍 URL:', OLD_SUPABASE_URL);
    console.log('🔑 Key:', OLD_SUPABASE_ANON_KEY.substring(0, 50) + '...');
    console.log('📊 Fetching employees data...');
    
    const { data, error } = await oldSupabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });
    
    console.log('📋 Query result:', { dataLength: data?.length, error });
    
    if (error) {
      console.error('❌ Error fetching employees:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No employees data found in old project');
      return false;
    }
    
    const filePath = path.join(exportDir, 'employees.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${data.length} employees to ${filePath}`);
    return true;
  } catch (err) {
    console.error('❌ Error exporting employees:', err);
    return false;
  }
}

// Function to export survey responses data
async function exportSurveyResponses() {
  try {
    console.log('📊 Fetching survey responses data...');
    
    const { data, error } = await oldSupabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: true });
    
    console.log('📋 Query result:', { dataLength: data?.length, error });
    
    if (error) {
      console.error('❌ Error fetching survey responses:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No survey responses data found in old project');
      return false;
    }
    
    const filePath = path.join(exportDir, 'survey_responses.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${data.length} survey responses to ${filePath}`);
    return true;
  } catch (err) {
    console.error('❌ Error exporting survey responses:', err);
    return false;
  }
}

// Function to generate SQL import scripts
function generateImportScripts() {
  try {
    console.log('Generating SQL import scripts...');
    
    // Read exported data
    const employeesPath = path.join(exportDir, 'employees.json');
    const surveyResponsesPath = path.join(exportDir, 'survey_responses.json');
    
    if (!fs.existsSync(employeesPath) || !fs.existsSync(surveyResponsesPath)) {
      console.error('Export files not found. Please run export first.');
      return false;
    }
    
    const employees = JSON.parse(fs.readFileSync(employeesPath, 'utf8'));
    const surveyResponses = JSON.parse(fs.readFileSync(surveyResponsesPath, 'utf8'));
    
    // Generate employees import SQL
    let employeesSQL = '-- Import employees data\n';
    employeesSQL += 'INSERT INTO public.employees (id, id_badge_number, name, department, status, created_at, updated_at) VALUES\n';
    
    const employeeValues = employees.map(emp => {
      const id = emp.id || 'gen_random_uuid()';
      const badgeNumber = emp.id_badge_number.replace(/'/g, "''");
      const name = emp.name.replace(/'/g, "''");
      const department = emp.department.replace(/'/g, "''");
      const status = emp.status || 'Not Submitted';
      const createdAt = emp.created_at;
      const updatedAt = emp.updated_at;
      
      return `('${id}', '${badgeNumber}', '${name}', '${department}', '${status}', '${createdAt}', '${updatedAt}')`;
    });
    
    employeesSQL += employeeValues.join(',\n') + ';\n\n';
    
    // Generate survey responses import SQL
    let surveySQL = '-- Import survey responses data\n';
    if (surveyResponses.length > 0) {
      const columns = Object.keys(surveyResponses[0]).join(', ');
      surveySQL += `INSERT INTO public.survey_responses (${columns}) VALUES\n`;
      
      const surveyValues = surveyResponses.map(response => {
        const values = Object.values(response).map(val => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          return val;
        });
        return `(${values.join(', ')})`;
      });
      
      surveySQL += surveyValues.join(',\n') + ';\n';
    }
    
    // Write SQL files
    const employeesSQLPath = path.join(exportDir, 'import_employees.sql');
    const surveySQLPath = path.join(exportDir, 'import_survey_responses.sql');
    
    fs.writeFileSync(employeesSQLPath, employeesSQL);
    fs.writeFileSync(surveySQLPath, surveySQL);
    
    console.log(`✅ Generated SQL import scripts:`);
    console.log(`   - ${employeesSQLPath}`);
    console.log(`   - ${surveySQLPath}`);
    
    return true;
  } catch (err) {
    console.error('Error generating import scripts:', err);
    return false;
  }
}

// Main export function
async function exportAllData() {
  console.log('🚀 Starting data export from old Supabase project...');
  console.log(`📍 Old Project URL: ${OLD_SUPABASE_URL}`);
  console.log(`📁 Export Directory: ${exportDir}`);
  console.log('');
  
  const employeesSuccess = await exportEmployees();
  const surveySuccess = await exportSurveyResponses();
  
  if (employeesSuccess && surveySuccess) {
    console.log('');
    generateImportScripts();
    console.log('');
    console.log('🎉 Data export completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Review exported data in data-export/ directory');
    console.log('   2. Run import scripts in new Supabase project');
    console.log('   3. Verify data integrity');
  } else {
    console.log('');
    console.log('❌ Data export failed. Please check the errors above.');
  }
}

// Run export if this script is executed directly
console.log('🚀 Script starting...');
console.log('📄 Script URL:', import.meta.url);
console.log('📄 Process argv[1]:', process.argv[1]);

// More reliable check for direct execution
const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution = process.argv[1] === scriptPath;

console.log('🔍 Script path:', scriptPath);
console.log('🔍 Is direct execution:', isDirectExecution);

if (isDirectExecution) {
  console.log('✅ Running export...');
  exportAllData();
} else {
  console.log('❌ Not running - script not executed directly');
}

export {
  exportEmployees,
  exportSurveyResponses,
  generateImportScripts,
  exportAllData
};