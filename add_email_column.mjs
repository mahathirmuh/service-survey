// Script to add email column to survey_responses table
// This script directly executes SQL to add the required email column

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addEmailColumn() {
  try {
    console.log('🔄 Adding email column to survey_responses table...');
    
    // Execute the SQL to add email column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add email column to survey_responses table
        ALTER TABLE public.survey_responses 
        ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
        
        -- Create index for performance on email lookups
        CREATE INDEX IF NOT EXISTS IX_survey_responses_email ON public.survey_responses(email);
      `
    });
    
    if (error) {
      console.error('❌ Error adding email column:', error);
      
      // Try alternative approach using direct SQL execution
      console.log('🔄 Trying alternative approach...');
      
      const { error: altError } = await supabase
        .from('survey_responses')
        .select('email')
        .limit(1);
      
      if (altError && altError.code === '42703') {
        console.log('✅ Email column does not exist, this confirms we need to add it.');
        console.log('⚠️  Database schema modification requires admin privileges.');
        console.log('💡 The email field has been added to the frontend form.');
        console.log('💡 When a user submits the form, it will fail until the database column is added.');
        console.log('💡 Please contact your database administrator to run the migration:');
        console.log('   ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT \'\';');
      } else {
        console.log('✅ Email column might already exist or there\'s another issue.');
      }
    } else {
      console.log('✅ Email column added successfully!');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    console.log('⚠️  This might be due to insufficient database permissions.');
    console.log('💡 The email field has been added to the frontend form.');
    console.log('💡 Please ensure the database schema includes the email column.');
  }
}

// Run the script
addEmailColumn();