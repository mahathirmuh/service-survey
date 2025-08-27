// Script to execute the survey_responses table schema in the new Supabase project
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// New Supabase project credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://ykxkbkxkfqxvvzlnqkxk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGtia3hrZnF4dnZ6bG5xa3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDk2NzQsImV4cCI6MjA3MTQyNTY3NH0.Wd0AkDvXnOPcMQQNyQXuLOQj8XJgnAzZLvS_xtRPT4Y';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSchema() {
  try {
    console.log('Executing survey_responses table schema in new Supabase project...');
    
    // Read the SQL file
    const alterTableSQL = fs.readFileSync('survey_responses_alter.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = alterTableSQL
      .split('ADD COLUMN IF NOT EXISTS')
      .filter(stmt => stmt.trim() !== '')
      .map((stmt, index) => {
        // First statement includes the ALTER TABLE part
        if (index === 0) {
          return stmt.trim();
        }
        // For other statements, add the ADD COLUMN IF NOT EXISTS back
        return `ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS ${stmt.trim()}`;
      });
    
    // Execute each statement individually
    for (const stmt of statements) {
      console.log(`Executing: ${stmt.substring(0, 100)}...`);
      
      try {
        // Use the Supabase client to execute SQL
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        
        if (error) {
          console.error(`Error executing statement: ${error.message}`);
          // Continue with next statement even if this one fails
        }
      } catch (stmtError) {
        console.error(`Exception executing statement: ${stmtError.message}`);
        // Continue with next statement even if this one fails
      }
    }
    
    console.log('Schema execution completed.');
    
    // Wait for schema cache to refresh (10 seconds)
    console.log('Waiting for schema cache to refresh...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Run the import script
    console.log('Running import-to-new-project.js...');
    const { stdout, stderr } = await execPromise('node import-to-new-project.js');
    
    console.log('Import script output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('Import script errors:');
      console.error(stderr);
    }
    
    console.log('Process completed.');
  } catch (error) {
    console.error('Error executing schema:', error.message);
  }
}

// Execute the schema
executeSchema();