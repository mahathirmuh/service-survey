// Run this script to add the missing environmental_management columns to the survey_responses table
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase project credentials
const SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL to add environmental_management columns
const addColumnsSQL = `
ALTER TABLE public.survey_responses
ADD COLUMN IF NOT EXISTS environmental_management_question1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_question2 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS environmental_management_feedback TEXT;
`;

// SQL to verify columns were added
const verifyColumnsSQL = `
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'environmental_management%';
`;

// Function to execute SQL using RPC (if available)
async function executeSQLViaRPC() {
  try {
    console.log('🔍 Attempting to add environmental_management columns via RPC...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: addColumnsSQL });
    
    if (error) {
      console.error('❌ RPC execution failed:', error.message);
      return false;
    }
    
    console.log('✅ SQL executed successfully via RPC');
    return true;
  } catch (err) {
    console.error('❌ Error executing SQL via RPC:', err.message);
    return false;
  }
}

// Function to verify columns exist
async function verifyColumns() {
  try {
    console.log('🔍 Verifying environmental_management columns...');
    
    // Try to select from the table with the new columns
    const { data, error } = await supabase
      .from('survey_responses')
      .select('environmental_management_feedback')
      .limit(1);
    
    if (error) {
      console.error('❌ Column verification failed:', error.message);
      return false;
    }
    
    console.log('✅ environmental_management columns verified');
    return true;
  } catch (err) {
    console.error('❌ Error verifying columns:', err.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting environmental_management columns addition...');
  
  // Try to execute SQL via RPC
  const rpcSuccess = await executeSQLViaRPC();
  
  if (!rpcSuccess) {
    console.log('⚠️ RPC execution failed. Please execute the following SQL in the Supabase SQL Editor:');
    console.log('\n' + addColumnsSQL);
    console.log('\nTo verify the columns were added, run:');
    console.log(verifyColumnsSQL);
  }
  
  // Verify columns exist
  const columnsExist = await verifyColumns();
  
  if (columnsExist) {
    console.log('🎉 environmental_management columns added successfully!');
    console.log('📋 Next step: Run the import-to-new-project.js script to import data');
    
    // Run the import script
    console.log('\n🔄 Running import-to-new-project.js...');
    try {
      const { main } = await import('./import-to-new-project.js');
      await main();
    } catch (err) {
      console.error('❌ Error running import script:', err.message);
    }
  } else {
    console.log('❌ Failed to add environmental_management columns');
    console.log('📋 Please add the columns manually and then run import-to-new-project.js');
  }
}

// Run the script
main();