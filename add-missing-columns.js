// Script to add missing columns to Supabase database
import { createClient } from '@supabase/supabase-js';

// New Supabase project credentials
const NEW_SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize new Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

async function addMissingColumns() {
  try {
    console.log('🚀 Adding missing columns to survey_responses table...');
    
    // Direct SQL to add the missing columns
    const { data, error } = await supabase.rpc('add_missing_columns');
    
    if (error) {
      console.error('❌ Error adding missing columns:', error);
      
      // Try alternative approach with direct SQL
      console.log('🔄 Trying alternative approach with direct SQL...');
      
      // Create a stored procedure to add the missing columns
      const createProcedureSQL = `
        CREATE OR REPLACE FUNCTION add_missing_columns()
        RETURNS void AS $$
        BEGIN
          ALTER TABLE public.survey_responses 
          ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0 CHECK (environmental_audit_question1 >= 0 AND environmental_audit_question1 <= 5),
          ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0 CHECK (environmental_audit_question2 >= 0 AND environmental_audit_question2 <= 5),
          ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createProcedureSQL });
      
      if (createError) {
        console.error('❌ Error creating procedure:', createError);
        return false;
      }
      
      // Call the procedure
      const { error: callError } = await supabase.rpc('add_missing_columns');
      
      if (callError) {
        console.error('❌ Error calling procedure:', callError);
        return false;
      }
    }
    
    console.log('✅ Successfully added missing columns');
    return true;
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
}

// Main function
async function main() {
  const success = await addMissingColumns();
  
  if (success) {
    console.log('✅ Migration successful!');
    console.log('📋 Next steps:');
    console.log('   1. Run the import-to-new-project.js script to import data');
    console.log('   2. Verify data in Supabase dashboard');
  } else {
    console.log('❌ Migration failed. Please check the errors above.');
    console.log('💡 Alternative approach: Run the SQL directly in the Supabase dashboard SQL editor:');
    console.log(`
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
    `);
  }
}

// Run the main function
main();