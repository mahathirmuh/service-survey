// Script to run migration from old to new Supabase
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// New Supabase project credentials
const NEW_SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize new Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

async function runMigration() {
  try {
    console.log('🚀 Starting migration from old to new Supabase...');
    
    // Step 1: Add missing columns directly with SQL
    console.log('📊 Adding missing columns to survey_responses table...');
    
    const addColumnsSQL = `
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
    `;
    
    // Execute SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql: addColumnsSQL });
    
    if (error) {
      console.error('❌ Error adding columns:', error);
      console.log('⚠️ Continuing with import anyway, as columns might already exist...');
    } else {
      console.log('✅ Successfully added missing columns');
    }
    
    // Step 2: Run the import script
    console.log('📥 Running import script...');
    const { stdout, stderr } = await execAsync('node import-to-new-project.js');
    
    console.log('📋 Import script output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('⚠️ Import script errors:');
      console.error(stderr);
    }
    
    console.log('🎉 Migration process completed!');
    return true;
  } catch (err) {
    console.error('❌ Error running migration:', err);
    return false;
  }
}

// Run the migration
runMigration();