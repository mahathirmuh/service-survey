// Script to execute SCM columns addition to survey_responses table
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeScmColumnsAddition() {
  console.log('Starting SCM columns addition...');
  
  try {
    // SQL to add SCM columns
    const sql = `
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS scm_inventory_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_inventory_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_inventory_feedback TEXT,
      ADD COLUMN IF NOT EXISTS scm_procurement_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_procurement_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_procurement_feedback TEXT,
      ADD COLUMN IF NOT EXISTS scm_logistic_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_logistic_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_logistic_feedback TEXT,
      ADD COLUMN IF NOT EXISTS scm_warehouse_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_warehouse_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS scm_warehouse_feedback TEXT;
    `;
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }
    
    console.log('SCM columns added successfully!');
    
    // Verify columns were added
    const verificationSql = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'survey_responses' 
      AND column_name LIKE 'scm_%';
    `;
    
    const { data, error: verificationError } = await supabase.rpc('exec_sql', { sql: verificationSql });
    
    if (verificationError) {
      throw verificationError;
    }
    
    console.log('Verification of SCM columns:');
    console.table(data);
    
    // Run import script
    console.log('\nNow running import-to-new-project.js...');
    try {
      const output = execSync('node import-to-new-project.js', { encoding: 'utf8' });
      console.log(output);
      console.log('Import completed successfully!');
    } catch (importError) {
      console.error('Error during import:', importError.message);
      console.error('Import script output:', importError.stdout);
      console.error('Import script error:', importError.stderr);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Execute the function
executeScmColumnsAddition();