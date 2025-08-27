// Script to execute SQL commands to add missing columns
// Run this script to add the missing environmental_audit columns to the survey_responses table

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New Supabase project credentials
const NEW_SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize new Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

// SQL to add missing columns
const alterTableSQL = `
ALTER TABLE public.survey_responses 
ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
`;

// SQL to verify columns were added
const verifyColumnsSQL = `
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
 * Execute SQL to add missing columns
 */
async function addMissingColumns() {
  try {
    console.log('🚀 Adding missing columns to survey_responses table...');
    
    // Try using RPC if available
    console.log('📊 Attempting to execute SQL via RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql: alterTableSQL });
    
    if (rpcError) {
      console.log('⚠️ RPC method failed:', rpcError.message);
      console.log('⚠️ This is expected as the RPC function may not be available.');
      console.log('⚠️ Please execute the SQL manually in the Supabase SQL Editor.');
      
      console.log('\n📋 SQL to execute in Supabase SQL Editor:');
      console.log(alterTableSQL);
      console.log('\n📋 SQL to verify columns were added:');
      console.log(verifyColumnsSQL);
      
      return false;
    }
    
    console.log('✅ Successfully added missing columns via RPC');
    return true;
  } catch (err) {
    console.error('❌ Error adding columns:', err);
    console.log('⚠️ Please execute the SQL manually in the Supabase SQL Editor.');
    
    console.log('\n📋 SQL to execute in Supabase SQL Editor:');
    console.log(alterTableSQL);
    console.log('\n📋 SQL to verify columns were added:');
    console.log(verifyColumnsSQL);
    
    return false;
  }
}

/**
 * Verify columns exist in the survey_responses table
 */
async function verifyColumns() {
  try {
    console.log('🔍 Verifying columns in survey_responses table...');
    
    const { data, error } = await supabase
      .from('survey_responses')
      .select('environmental_audit_feedback')
      .limit(1);
    
    if (error) {
      console.error('❌ Error verifying columns:', error);
      return false;
    }
    
    console.log('✅ Columns verified successfully');
    return true;
  } catch (err) {
    console.error('❌ Error verifying columns:', err);
    return false;
  }
}

/**
 * Run the import script
 */
async function runImportScript() {
  try {
    console.log('📥 Running import script...');
    const { stdout, stderr } = await execAsync('node import-to-new-project.js');
    
    console.log('📋 Import script output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('⚠️ Import script errors:');
      console.error(stderr);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('❌ Error running import script:', err);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting SQL execution and data import process...');
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
  
  // Step 2: Verify columns
  const columnsVerified = await verifyColumns();
  console.log('');
  
  if (!columnsVerified) {
    console.log('⚠️ Column verification failed.');
    console.log('⚠️ Please check the Supabase dashboard to ensure columns were added.');
    console.log('⚠️ After verifying columns, run this script again to import data.');
    return;
  }
  
  // Step 3: Run import script
  const importSuccess = await runImportScript();
  console.log('');
  
  // Summary
  console.log('📋 Summary:');
  console.log(`   - Column addition: ${columnsAdded ? '✅ Success' : '❌ Failed/Manual'}`);
  console.log(`   - Column verification: ${columnsVerified ? '✅ Success' : '❌ Failed'}`);
  console.log(`   - Data import: ${importSuccess ? '✅ Success' : '❌ Failed'}`);
  
  if (columnsAdded && columnsVerified && importSuccess) {
    console.log('🎉 Process completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Verify data in Supabase dashboard');
    console.log('   2. Test application functionality');
  } else {
    console.log('⚠️ Process completed with issues.');
    console.log('📋 Please address the issues above before continuing.');
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
});