// Script to directly run SQL commands on Supabase
import { createClient } from '@supabase/supabase-js';

// New Supabase project credentials
const SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSql() {
  try {
    console.log('🔍 Running SQL to add missing columns...');
    
    // SQL to add environmental_audit columns
    const sql = `
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
    `;
    
    // Execute SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach with direct query
      console.log('🔄 Trying alternative approach...');
      const { data: directData, error: directError } = await supabase
        .from('survey_responses')
        .select('id')
        .limit(1);
      
      if (directError) {
        console.error('❌ Error with direct query:', directError);
      } else {
        console.log('✅ Direct query successful');
        console.log('⚠️ Please run the SQL manually in the Supabase SQL Editor');
      }
    } else {
      console.log('✅ SQL executed successfully:', data);
      
      // Verify columns were added
      const verifySql = `
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
      
      const { data: verifyData, error: verifyError } = await supabase.rpc('exec_sql', { query: verifySql });
      
      if (verifyError) {
        console.error('❌ Error verifying columns:', verifyError);
      } else {
        console.log('✅ Columns verification:', verifyData);
      }
      
      // Run import script
      console.log('📥 Now run the import script: node import-to-new-project.js');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

runSql();