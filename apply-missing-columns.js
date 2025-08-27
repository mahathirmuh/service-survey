// Script to apply missing columns to Supabase database
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New Supabase project credentials
const NEW_SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize new Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

async function applyMissingColumns() {
  try {
    console.log('🚀 Adding missing columns to survey_responses table...');
    
    // Add environmental_audit columns
    console.log('📊 Adding environmental_audit columns...');
    const { error: auditError } = await supabase
      .from('survey_responses')
      .select('id')
      .limit(1)
      .single();
    
    if (auditError) {
      console.error('❌ Error accessing survey_responses table:', auditError);
      return false;
    }
    
    // Direct SQL to add the missing columns
    const addColumnsSQL = `
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0 CHECK (environmental_audit_question1 >= 0 AND environmental_audit_question1 <= 5),
      ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0 CHECK (environmental_audit_question2 >= 0 AND environmental_audit_question2 <= 5),
      ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
    `;
    
    // Execute the SQL using the REST API
    const response = await fetch(`${NEW_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': NEW_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${NEW_SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: addColumnsSQL
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error executing SQL:', errorData);
      return false;
    }
    
    console.log('✅ Successfully added environmental_audit columns');
    
    // Verify the columns were added
    console.log('🔍 Verifying columns were added...');
    
    // Try to import survey responses again
    console.log('📊 Running import script to import survey responses...');
    
    // Import the main function from import-to-new-project.js
    const { main } = await import('./import-to-new-project.js');
    await main();
    
    return true;
  } catch (err) {
    console.error('❌ Error applying missing columns:', err);
    return false;
  }
}

// Main function
async function main() {
  const success = await applyMissingColumns();
  
  if (success) {
    console.log('✅ Migration successful!');
  } else {
    console.log('❌ Migration failed. Please check the errors above.');
    console.log('💡 Alternative approach: Run the SQL directly in the Supabase dashboard SQL editor:');
    console.log(`
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS environmental_audit_question1 INTEGER DEFAULT 0 CHECK (environmental_audit_question1 >= 0 AND environmental_audit_question1 <= 5),
      ADD COLUMN IF NOT EXISTS environmental_audit_question2 INTEGER DEFAULT 0 CHECK (environmental_audit_question2 >= 0 AND environmental_audit_question2 <= 5),
      ADD COLUMN IF NOT EXISTS environmental_audit_feedback TEXT;
    `);
  }
}

// Run if executed directly
const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution = process.argv[1] === scriptPath;

if (isDirectExecution) {
  main();
}

export { applyMissingColumns };