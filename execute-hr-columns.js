import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI3MzI2NjAsImV4cCI6MjAwODMwODY2MH0.q9ZZ5GrQTlwvqCYjf0_T_JYSeCbP-JGsYgJjnFCQVQE';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to add HR columns
const addHRColumnsSQL = `
ALTER TABLE public.survey_responses 
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
ADD COLUMN IF NOT EXISTS hr_performance_feedback TEXT;
`;

// SQL to verify columns were added
const verifyColumnsSQL = `
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'hr_%';
`;

// Function to add HR columns
async function addHRColumns() {
  console.log('🚀 Adding HR columns to survey_responses table...');
  
  try {
    // Execute SQL to add HR columns
    const { data: addResult, error: addError } = await supabase.rpc('pgaudit.exec_sql', {
      sql: addHRColumnsSQL
    });
    
    if (addError) {
      console.error('❌ Error adding HR columns:', addError);
      console.log('\n📝 Please execute the SQL manually in the Supabase SQL Editor:');
      console.log(addHRColumnsSQL);
      return false;
    }
    
    console.log('✅ HR columns added successfully');
    
    // Verify columns were added
    const { data: verifyResult, error: verifyError } = await supabase.rpc('pgaudit.exec_sql', {
      sql: verifyColumnsSQL
    });
    
    if (verifyError) {
      console.error('❌ Error verifying HR columns:', verifyError);
      return false;
    }
    
    if (verifyResult && verifyResult.length > 0) {
      console.log('✅ Verified HR columns were added:');
      console.table(verifyResult);
      return true;
    } else {
      console.error('❌ HR columns were not found in the table');
      return false;
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Function to run import script
function runImport() {
  console.log('\n🔄 Running import script...');
  
  exec('node import-to-new-project.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error running import script: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`⚠️ Import script stderr: ${stderr}`);
    }
    
    console.log('📋 Import script output:');
    console.log(stdout);
  });
}

// Main function
async function main() {
  console.log('🔧 Starting HR columns addition and data import...');
  
  const columnsAdded = await addHRColumns();
  
  if (columnsAdded) {
    console.log('\n✅ HR columns added successfully. Running import script...');
    runImport();
  } else {
    console.log('\n⚠️ Failed to add or verify HR columns.');
    console.log('📝 Please execute the SQL manually in the Supabase SQL Editor:');
    console.log(addHRColumnsSQL);
    console.log('\n📝 After executing the SQL, run the import script:');
    console.log('node import-to-new-project.js');
  }
}

// Run the main function
main();