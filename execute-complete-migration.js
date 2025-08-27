// Script to execute the complete migration SQL using Supabase service role key
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase project credentials
const SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';

// We'll use the service role key if available, otherwise fall back to anon key
// NOTE: For production use, the service role key should be stored securely
// and never committed to version control
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Use service key if available, otherwise use anon key
const apiKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, apiKey);

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'complete-migration.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split SQL into individual statements
// We'll split by the ADD COLUMN statements to ensure each column addition is a separate statement
function splitSqlStatements(sql) {
  // First, remove comments
  const sqlWithoutComments = sql.replace(/--.*$/gm, '');
  
  // Split the ALTER TABLE statement into individual ADD COLUMN statements
  const alterTableMatch = sqlWithoutComments.match(/ALTER TABLE.*?\s+(ADD COLUMN.*?);/s);
  
  if (!alterTableMatch) {
    return [sql]; // Return the original SQL if no ALTER TABLE statement found
  }
  
  const alterTablePrefix = sqlWithoutComments.substring(0, alterTableMatch.index) + 'ALTER TABLE public.survey_responses ';
  const addColumnStatements = alterTableMatch[1].split(',\n');
  
  // Create individual ALTER TABLE statements for each ADD COLUMN
  const statements = addColumnStatements.map(stmt => {
    return alterTablePrefix + stmt.trim() + ';';
  });
  
  // Add the verification query as the last statement
  const verifyQuery = sqlWithoutComments.match(/SELECT[\s\S]*?;$/m);
  if (verifyQuery) {
    statements.push(verifyQuery[0]);
  }
  
  return statements;
}

/**
 * Execute SQL using fetch API directly
 */
async function executeSQLWithFetch(sql) {
  console.log('🚀 Executing SQL with fetch API...');
  console.log('📝 SQL:', sql.substring(0, 100) + '...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        sql_string: sql
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SQL executed successfully!');
      return { success: true, result };
    } else {
      const error = await response.text();
      console.log('❌ Failed to execute SQL:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute SQL using Supabase client
 */
async function executeSQLWithClient(sql) {
  console.log('🚀 Executing SQL with Supabase client...');
  console.log('📝 SQL:', sql.substring(0, 100) + '...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });
    
    if (error) {
      console.log('❌ Failed to execute SQL with client:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ SQL executed successfully with client!');
    return { success: true, result: data };
  } catch (error) {
    console.error('❌ Error executing SQL with client:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to execute the migration
 */
async function main() {
  console.log('🚀 Starting complete migration process...');
  console.log('📂 Reading SQL from:', sqlFilePath);
  
  // Split the SQL into individual statements
  const statements = splitSqlStatements(sqlContent);
  console.log(`📊 Found ${statements.length} SQL statements to execute`);
  
  let allSuccessful = true;
  let results = [];
  
  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n🔄 Executing statement ${i + 1} of ${statements.length}...`);
    
    // Try with Supabase client first
    let result = await executeSQLWithClient(statement);
    
    // If that fails, try with fetch API
    if (!result.success) {
      console.log('⚠️ Client execution failed, trying with fetch API...');
      result = await executeSQLWithFetch(statement);
    }
    
    results.push({
      statement: statement.substring(0, 50) + '...',
      success: result.success,
      result: result.result,
      error: result.error
    });
    
    if (!result.success) {
      allSuccessful = false;
    }
  }
  
  // Wait for schema cache to refresh
  console.log('\n⏳ Waiting for schema cache to refresh (15 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Run import script if all statements were successful
  if (allSuccessful) {
    console.log('\n🚀 All SQL statements executed successfully!');
    console.log('📊 Running import-to-new-project.js...');
    
    try {
      const { stdout, stderr } = await execAsync('node import-to-new-project.js');
      console.log('📋 Import script output:\n', stdout);
      
      if (stderr) {
        console.error('⚠️ Import script stderr:\n', stderr);
      }
      
      console.log('\n🎉 Migration completed successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Verify data in Supabase dashboard');
      console.log('   2. Test application functionality');
    } catch (error) {
      console.error('❌ Error running import script:', error.message);
      console.log('⚠️ Migration completed with issues.');
      console.log('📋 Please check the error above and run the import script manually if needed.');
    }
  } else {
    console.log('\n⚠️ Some SQL statements failed to execute.');
    console.log('📋 Results summary:');
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.success ? '✅' : '❌'} ${result.statement}`);
      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    console.log('\n📋 Please run the SQL manually in the Supabase SQL Editor using the admin credentials:');
    console.log('   Username: postgres');
    console.log('   Password: See EXECUTE-MIGRATION-MANUAL.md');
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
});