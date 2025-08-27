// Combined Migration Script for Supabase Project
// This script adds missing columns and imports data in one operation

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

// Function to check if a column exists in a table
async function columnExists(tableName, columnName) {
  try {
    const { data, error } = await newSupabase.rpc('column_exists', {
      p_table_name: tableName,
      p_column_name: columnName
    });
    
    if (error) {
      console.error(`❌ Error checking if column ${columnName} exists:`, error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`❌ Error in columnExists function:`, err.message);
    return null;
  }
}

// Function to add missing columns using direct SQL query
async function addMissingColumns() {
  try {
    console.log('🔧 Checking for missing environmental audit columns...');
    
    // First, check if the columns already exist
    const { data, error } = await newSupabase
      .from('survey_responses')
      .select('environmental_audit_feedback')
      .limit(1);
    
    if (!error) {
      console.log('✅ Environmental audit columns already exist');
      return true;
    }
    
    console.log('🔍 Environmental audit columns missing, attempting to add them...');
    
    // Try using the SQL function if available
    try {
      const addColumnResult = await newSupabase.rpc('exec_sql', {
        sql_string: `
          ALTER TABLE public.survey_responses 
          ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
        `
      });
      
      if (!addColumnResult.error) {
        console.log('✅ Successfully added environmental audit columns using exec_sql');
        return true;
      }
    } catch (rpcError) {
      console.log('ℹ️ exec_sql function not available, trying alternative methods...');
    }
    
    // Try using the REST API directly
    try {
      const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/rpc/alter_table_add_column`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': NEW_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          table_name: 'survey_responses',
          column_name: 'environmental_audit_question1',
          column_type: 'INTEGER'
        })
      });
      
      if (response.ok) {
        console.log('✅ Added environmental_audit_question1 column using REST API');
        
        // Add the other columns
        const response2 = await fetch(`${NEW_SUPABASE_URL}/rest/v1/rpc/alter_table_add_column`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': NEW_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            table_name: 'survey_responses',
            column_name: 'environmental_audit_question2',
            column_type: 'INTEGER'
          })
        });
        
        const response3 = await fetch(`${NEW_SUPABASE_URL}/rest/v1/rpc/alter_table_add_column`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': NEW_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            table_name: 'survey_responses',
            column_name: 'environmental_audit_feedback',
            column_type: 'TEXT'
          })
        });
        
        if (response2.ok && response3.ok) {
          console.log('✅ Successfully added all environmental audit columns using REST API');
          return true;
        }
      }
    } catch (restError) {
      console.log('ℹ️ REST API method not available, trying direct query...');
    }
    
    // If all else fails, inform the user to run the SQL manually
    console.log('⚠️ Automated column addition failed');
    console.log('📝 Please run the following SQL in the Supabase SQL Editor:');
    console.log(`
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
    `);
    
    // Check if the SQL file exists and remind the user
    const sqlFilePath = path.join(__dirname, 'add-missing-columns.sql');
    if (fs.existsSync(sqlFilePath)) {
      console.log(`📄 You can find this SQL in the file: ${sqlFilePath}`);
    }
    
    return false;
  } catch (err) {
    console.error('❌ Error adding missing columns:', err);
    return false;
  }
}

// Function to import employees data
async function importEmployees() {
  try {
    console.log('📊 Importing employees data...');
    
    // Try to read from exported data
    const exportedFilePath = path.join(__dirname, 'data-export', 'employees.json');
    if (!fs.existsSync(exportedFilePath)) {
      console.log('⚠️ No exported employees data found');
      return false;
    }
    
    const employees = JSON.parse(fs.readFileSync(exportedFilePath, 'utf8'));
    console.log(`📁 Loaded ${employees.length} employees from exported data`);
    
    if (employees.length === 0) {
      console.log('ℹ️ No employees to import');
      return true;
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
    
    // First verify the columns exist
    try {
      const { data, error } = await newSupabase
        .from('survey_responses')
        .select('environmental_audit_feedback')
        .limit(1);
      
      if (error) {
        console.error('❌ Environmental audit columns are still missing. Please run the SQL script first.');
        return false;
      }
    } catch (err) {
      console.error('❌ Error verifying columns:', err);
      return false;
    }
    
    // Insert the data
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

// Main function
async function main() {
  console.log('🚀 Starting combined migration process...');
  console.log('');
  
  // Step 1: Add missing columns
  const columnsAdded = await addMissingColumns();
  console.log('');
  
  if (!columnsAdded) {
    console.log('⚠️ Column addition failed or requires manual intervention.');
    console.log('⚠️ Please run the SQL script in the Supabase SQL Editor before continuing.');
    console.log('⚠️ After adding columns, run this script again to import data.');
    return;
  }
  
  // Step 2: Import employees
  const employeesSuccess = await importEmployees();
  console.log('');
  
  // Step 3: Import survey responses
  const surveySuccess = await importSurveyResponses();
  console.log('');
  
  // Summary
  if (employeesSuccess || surveySuccess) {
    console.log('🎉 Migration completed!');
    console.log('📋 Summary:');
    console.log(`   - Column addition: ${columnsAdded ? '✅ Success' : '❌ Failed/Manual'}`); 
    console.log(`   - Employees import: ${employeesSuccess ? '✅ Success' : '❌ Failed'}`); 
    console.log(`   - Survey responses import: ${surveySuccess ? '✅ Success' : '❌ Failed'}`);
    console.log('📋 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Test application functionality');
    console.log('   3. Update migration journal');
  } else {
    console.log('❌ Migration failed. Please check the errors above.');
  }
}

// Run if executed directly
const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution = process.argv[1] === scriptPath;

if (isDirectExecution) {
  main();
}

export {
  addMissingColumns,
  importEmployees,
  importSurveyResponses,
  main
};