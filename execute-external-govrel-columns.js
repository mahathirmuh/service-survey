import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

// Convert exec to Promise-based
const execAsync = promisify(exec);

// Supabase configuration
const NEW_SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTI3MjY1NTcsImV4cCI6MjAwODMwMjU1N30.YjQ-9RFI9HLlMdN_UzJPPxwlWEDnhBt01CGBcJKxLLk';

// Initialize Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask user for input
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to add external_govrel and external_communityrelations columns using RPC
async function addExternalGovrelColumns() {
  try {
    console.log('🔄 Adding external_govrel and external_communityrelations columns to survey_responses table...');
    
    // SQL to add external_govrel and external_communityrelations columns
    const sql = `
    ALTER TABLE public.survey_responses 
    ADD COLUMN IF NOT EXISTS external_govrel_question1 INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS external_govrel_question2 INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS external_govrel_feedback TEXT,
    ADD COLUMN IF NOT EXISTS external_communityrelations_question1 INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS external_communityrelations_question2 INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS external_communityrelations_feedback TEXT;
    `;
    
    // Execute SQL using RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error adding columns via RPC:', error.message);
      console.log('\n⚠️ The RPC method failed. You need to execute the SQL manually in the Supabase SQL Editor.');
      console.log('\n📋 SQL to execute:');
      console.log(sql);
      
      // Verification SQL
      console.log('\n📋 After executing the SQL, run this verification query:');
      console.log(`
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'survey_responses' 
AND column_name LIKE 'external_%';
`);
      
      console.log('\nAfter executing the SQL manually, run this script again to continue with the import.');
      
      const answer = await askQuestion('\n⚠️ If you have already executed the SQL manually, press Enter to continue with verification and import...');
      return false;
    }
    
    console.log('✅ External_govrel and external_communityrelations columns added successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Function to verify external_govrel and external_communityrelations columns exist
async function verifyExternalGovrelColumns() {
  try {
    console.log('🔍 Verifying external_govrel and external_communityrelations columns...');
    
    // Query to check if columns exist
    const { data, error } = await supabase
      .from('survey_responses')
      .select('external_govrel_question1, external_govrel_question2, external_govrel_feedback, external_communityrelations_question1, external_communityrelations_question2, external_communityrelations_feedback')
      .limit(1);
    
    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
    
    console.log('✅ External_govrel and external_communityrelations columns verified');
    return true;
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    return false;
  }
}

// Function to run the import script
async function runImportScript() {
  try {
    console.log('\n🔄 Running import-to-new-project.js...');
    const { stdout, stderr } = await execAsync('node import-to-new-project.js');
    console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error('❌ Error running import script:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Step 1: Add external_govrel and external_communityrelations columns
    const columnsAdded = await addExternalGovrelColumns();
    
    // Step 2: Verify columns exist
    const columnsVerified = await verifyExternalGovrelColumns();
    
    if (columnsVerified) {
      console.log('🎉 External_govrel and external_communityrelations columns added successfully!');
      
      // Step 3: Run import script
      await runImportScript();
      
      console.log('\n📋 Migration process summary:');
      console.log('1. ✅ Added external_govrel and external_communityrelations columns to survey_responses table');
      console.log('2. ✅ Ran data import script');
      
      console.log('\n📋 Next steps:');
      console.log('1. Verify data in Supabase dashboard');
      console.log('2. Test application functionality');
      console.log('3. Update migration journal with results');
    } else {
      console.log('\n❌ Failed to add or verify external_govrel and external_communityrelations columns.');
      console.log('Please execute the SQL manually in the Supabase SQL Editor and run this script again.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the main function
main();