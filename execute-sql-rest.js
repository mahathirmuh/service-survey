// Script to execute SQL directly via REST API
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// New Supabase project credentials
const supabaseUrl = 'https://ykxkbkxkfqxvvzlnqkxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGtia3hrZnF4dnZ6bG5xa3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDk2NzQsImV4cCI6MjA3MTQyNTY3NH0.Wd0AkDvXnOPcMQQNyQXuLOQj8XJgnAzZLvS_xtRPT4Y';

async function executeSQLRest() {
  try {
    console.log('Executing SQL via REST API...');
    
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
        // Execute SQL via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            sql: stmt
          })
        });
        
        const result = await response.text();
        
        if (!response.ok) {
          console.error(`Error executing statement: ${result}`);
          // Continue with next statement even if this one fails
        } else {
          console.log(`Statement executed successfully.`);
        }
      } catch (stmtError) {
        console.error(`Exception executing statement: ${stmtError.message}`);
        // Continue with next statement even if this one fails
      }
    }
    
    console.log('SQL execution completed.');
    
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
    console.error('Error executing SQL:', error.message);
  }
}

// Execute the SQL
executeSQLRest();