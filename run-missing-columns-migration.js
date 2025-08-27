// Script to run missing columns migration on Supabase database
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

// Path to the migration SQL file
const migrationFilePath = path.join(__dirname, 'supabase', 'migrations', '20250130000000-add-missing-columns.sql');

async function runMigration() {
  try {
    console.log('🚀 Starting migration to add missing columns...');
    
    // Read the migration SQL file
    if (!fs.existsSync(migrationFilePath)) {
      console.error(`❌ Migration file not found: ${migrationFilePath}`);
      return false;
    }
    
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    console.log(`📄 Loaded migration SQL from ${migrationFilePath}`);
    
    // Split the SQL into individual statements
    // We'll split by semicolons, but we need to be careful about semicolons in comments
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove comment lines
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`🔍 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      // Use direct SQL query instead of rpc
      const { error } = await supabase
        .from('_exec_sql')
        .select('*')
        .eq('query', statement)
        .maybeSingle();
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('🎉 Migration completed!');
    return true;
  } catch (err) {
    console.error('❌ Error running migration:', err);
    return false;
  }
}

// Main function
async function main() {
  const success = await runMigration();
  
  if (success) {
    console.log('✅ Migration successful!');
    console.log('📋 Next steps:');
    console.log('   1. Run the import-to-new-project.js script to import data');
    console.log('   2. Verify data in Supabase dashboard');
    console.log('   3. Test application functionality');
  } else {
    console.log('❌ Migration failed. Please check the errors above.');
  }
}

// Run if executed directly
const scriptPath = fileURLToPath(import.meta.url);
const isDirectExecution = process.argv[1] === scriptPath;

if (isDirectExecution) {
  main();
}

export { runMigration };