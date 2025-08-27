// Execute all HR columns script
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import fs from 'fs';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.log('Please set the SUPABASE_SERVICE_ROLE_KEY environment variable or run the SQL manually in the Supabase SQL Editor');
  console.log('SQL to execute:');
  console.log(`
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
ADD COLUMN IF NOT EXISTS hr_talentacquisition_feedback TEXT;
`);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to add all HR columns
const sql = `
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
ADD COLUMN IF NOT EXISTS hr_talentacquisition_feedback TEXT;
`;

// Verification SQL
const verificationSql = `
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'hr_%';
`;

// Function to execute SQL via RPC
async function executeSql() {
  try {
    console.log('Adding HR columns to survey_responses table...');
    
    // Execute SQL via RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });
    
    if (error) {
      throw error;
    }
    
    console.log('HR columns added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding HR columns:', error.message);
    console.log('Please execute the SQL manually in the Supabase SQL Editor.');
    return false;
  }
}

// Function to verify columns were added
async function verifyColumns() {
  try {
    console.log('Verifying HR columns...');
    
    // Execute verification SQL via RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: verificationSql
    });
    
    if (error) {
      throw error;
    }
    
    // Check if all expected columns are present
    const expectedColumns = [
      'hr_comben_question1',
      'hr_comben_question2',
      'hr_comben_feedback',
      'hr_recruitment_question1',
      'hr_recruitment_question2',
      'hr_recruitment_feedback',
      'hr_training_question1',
      'hr_training_question2',
      'hr_training_feedback',
      'hr_performance_question1',
      'hr_performance_question2',
      'hr_performance_feedback',
      'hr_ir_question1',
      'hr_ir_question2',
      'hr_ir_feedback',
      'hr_documentcontrol_question1',
      'hr_documentcontrol_question2',
      'hr_documentcontrol_feedback',
      'hr_itsupport_question1',
      'hr_itsupport_question2',
      'hr_itsupport_feedback',
      'hr_itfield_question1',
      'hr_itfield_question2',
      'hr_itfield_feedback',
      'hr_siteservice_question1',
      'hr_siteservice_question2',
      'hr_siteservice_feedback',
      'hr_peopledev_question1',
      'hr_peopledev_question2',
      'hr_peopledev_feedback',
      'hr_translator_question1',
      'hr_translator_question2',
      'hr_translator_feedback',
      'hr_talentacquisition_question1',
      'hr_talentacquisition_question2',
      'hr_talentacquisition_feedback'
    ];
    
    // Extract column names from the result
    const foundColumns = data.map(row => row.column_name);
    
    // Check if all expected columns are present
    const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing columns:', missingColumns);
      return false;
    }
    
    console.log('All HR columns verified successfully!');
    return true;
  } catch (error) {
    console.error('Error verifying HR columns:', error.message);
    return false;
  }
}

// Function to run the import script
function runImportScript() {
  console.log('Running import-to-new-project.js...');
  
  exec('node import-to-new-project.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running import script: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Import script stderr: ${stderr}`);
      return;
    }
    
    console.log(`Import script output: ${stdout}`);
    console.log('Import completed successfully!');
  });
}

// Main function
async function main() {
  try {
    // Execute SQL to add columns
    const columnsAdded = await executeSql();
    
    if (!columnsAdded) {
      console.log('Failed to add HR columns. Please execute the SQL manually and then run import-to-new-project.js');
      process.exit(1);
    }
    
    // Verify columns were added
    const columnsVerified = await verifyColumns();
    
    if (!columnsVerified) {
      console.log('Failed to verify HR columns. Please check the Supabase dashboard and run import-to-new-project.js manually.');
      process.exit(1);
    }
    
    // Run import script
    runImportScript();
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();