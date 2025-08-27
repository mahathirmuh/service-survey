import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Supabase credentials from client.ts
const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

// SQL to execute
const SQL_TO_EXECUTE = `
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
`;

/**
 * Execute SQL directly using Supabase REST API
 */
async function executeSQLDirectly() {
  console.log('🚀 Attempting to execute SQL directly via REST API...');
  
  try {
    // First, try using the SQL HTTP API
    console.log('📡 Using Supabase SQL HTTP API...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: SQL_TO_EXECUTE
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SQL executed successfully!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
      return true;
    } else {
      console.log('❌ Failed to execute SQL via REST API:', result);
      
      // Try alternative approach - using the pgrest API
      console.log('📡 Trying alternative approach with pgrest API...');
      
      const pgrestResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sql_string: SQL_TO_EXECUTE
        })
      });
      
      const pgrestResult = await pgrestResponse.json();
      
      if (pgrestResponse.ok) {
        console.log('✅ SQL executed successfully via pgrest API!');
        console.log('📊 Result:', JSON.stringify(pgrestResult, null, 2));
        return true;
      } else {
        console.log('❌ Failed to execute SQL via pgrest API:', pgrestResult);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
    return false;
  }
}

/**
 * Verify if the columns exist in the survey_responses table
 */
async function verifyColumns() {
  console.log('🔍 Verifying if columns exist...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/survey_responses?select=environmental_audit_feedback&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    
    if (response.ok) {
      console.log('✅ Column verification successful!');
      return true;
    } else {
      console.log('❌ Column verification failed:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying columns:', error);
    return false;
  }
}

/**
 * Main function to execute SQL and verify columns
 */
async function main() {
  console.log('🚀 Starting direct SQL execution process...');
  
  // Execute SQL
  const sqlExecuted = await executeSQLDirectly();
  
  if (sqlExecuted) {
    console.log('✅ SQL execution completed!');
    
    // Verify columns
    const columnsExist = await verifyColumns();
    
    if (columnsExist) {
      console.log('🎉 Columns added successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Run import-to-new-project.js to import data');
      console.log('   2. Verify data in Supabase dashboard');
      console.log('   3. Test application functionality');
    } else {
      console.log('⚠️ Columns may not have been added correctly.');
      console.log('📋 Please check the Supabase dashboard and run the SQL manually if needed.');
    }
  } else {
    console.log('⚠️ SQL execution failed.');
    console.log('📋 Please run the SQL manually in the Supabase SQL Editor:');
    console.log(SQL_TO_EXECUTE);
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
});