import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase credentials
const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
// This is a placeholder for the service role key - we'll use the Supabase CLI instead
const SUPABASE_SERVICE_KEY = "service_role_key_placeholder";

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read the SQL file
const sqlFilePath = path.resolve('./add-missing-columns.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Extract just the ALTER TABLE statement (without the verification query)
const alterTableSQL = sqlContent.split('-- Verify columns were added')[0].trim();

/**
 * Execute the migration SQL
 */
async function executeMigration() {
  console.log('🚀 Executing migration to add missing columns...');
  
  try {
    // Execute the SQL with admin privileges
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: alterTableSQL
    });
    
    if (error) {
      console.error('❌ Error executing migration with RPC:', error);
      
      // Try direct query as fallback
      console.log('🔄 Trying direct query as fallback...');
      
      const { data: directData, error: directError } = await supabase.from('rpc').select('*').rpc('exec_sql', {
        sql_string: alterTableSQL
      });
      
      if (directError) {
        console.error('❌ Error with direct query:', directError);
        return false;
      }
      
      console.log('✅ Migration executed successfully with direct query!');
      return true;
    }
    
    console.log('✅ Migration executed successfully with RPC!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error executing migration:', error);
    return false;
  }
}

/**
 * Verify if the columns exist
 */
async function verifyColumns() {
  console.log('🔍 Verifying if columns were added...');
  
  try {
    // Query to check if the columns exist
    const { data, error } = await supabase
      .from('survey_responses')
      .select('environmental_audit_feedback')
      .limit(1);
    
    if (error) {
      console.error('❌ Error verifying columns:', error);
      return false;
    }
    
    console.log('✅ Columns verified successfully!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error verifying columns:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting migration process with admin privileges...');
  
  // Execute migration
  const migrationSuccess = await executeMigration();
  
  if (migrationSuccess) {
    console.log('✅ Migration completed successfully!');
    
    // Verify columns
    const columnsExist = await verifyColumns();
    
    if (columnsExist) {
      console.log('🎉 Columns added and verified successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Run import-to-new-project.js to import data');
      console.log('   2. Verify data in Supabase dashboard');
      console.log('   3. Test application functionality');
    } else {
      console.log('⚠️ Columns may have been added but verification failed.');
      console.log('📋 Please check the Supabase dashboard manually.');
    }
  } else {
    console.log('⚠️ Migration failed.');
    console.log('📋 Please run the SQL manually in the Supabase SQL Editor:');
    console.log(alterTableSQL);
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
});