import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Supabase credentials
const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
// Using the admin password to create a service key
const ADMIN_PASSWORD = "T$1ngsh4n@24";
// For security, we'll use a placeholder and construct the actual key at runtime
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "service_role_key_placeholder";

// Read the SQL file
const sqlFilePath = path.resolve('./add-missing-columns.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Extract just the ALTER TABLE statement (without the verification query)
const alterTableSQL = sqlContent.split('-- Verify columns were added')[0].trim();

/**
 * Execute SQL using Supabase REST API
 */
async function executeSQLWithREST() {
  console.log('Executing SQL using Supabase REST API...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        sql_string: alterTableSQL
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error executing SQL with REST API:', errorText);
      return false;
    }
    
    console.log('SQL executed successfully with REST API!');
    return true;
  } catch (error) {
    console.error('Unexpected error executing SQL with REST API:', error);
    return false;
  }
}

/**
 * Execute SQL using direct PostgreSQL connection
 */
async function executeSQLWithDirectConnection() {
  console.log('Executing SQL using direct PostgreSQL connection...');
  
  try {
    // This is a placeholder for direct PostgreSQL connection
    // In a real implementation, you would use a PostgreSQL client library
    // such as 'pg' to connect directly to the database
    console.log('Direct PostgreSQL connection not implemented.');
    return false;
  } catch (error) {
    console.error('Unexpected error executing SQL with direct connection:', error);
    return false;
  }
}

/**
 * Verify if the columns exist
 */
async function verifyColumns() {
  console.log('Verifying if columns were added...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/survey_responses?select=environmental_audit_feedback&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error verifying columns:', errorText);
      return false;
    }
    
    console.log('Columns verified successfully!');
    return true;
  } catch (error) {
    console.error('Unexpected error verifying columns:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting migration process with admin credentials...');
  
  // Try executing SQL with REST API
  let success = await executeSQLWithREST();
  
  // If REST API fails, try direct PostgreSQL connection
  if (!success) {
    console.log('REST API failed, trying direct PostgreSQL connection...');
    success = await executeSQLWithDirectConnection();
  }
  
  if (success) {
    console.log('Migration executed successfully!');
    
    // Verify columns
    const columnsExist = await verifyColumns();
    
    if (columnsExist) {
      console.log('Columns added and verified successfully!');
      console.log('Next steps:');
      console.log('   1. Run import-to-new-project.js to import data');
      console.log('   2. Verify data in Supabase dashboard');
      console.log('   3. Test application functionality');
      
      // Run import script
      console.log('Running import script...');
      const { execSync } = await import('child_process');
      try {
        execSync('node import-to-new-project.js', { stdio: 'inherit' });
        console.log('Import completed successfully!');
      } catch (error) {
        console.error('Error running import script:', error);
      }
    } else {
      console.log('Columns may have been added but verification failed.');
      console.log('Please check the Supabase dashboard manually.');
    }
  } else {
    console.log('Migration failed.');
    console.log('Please run the SQL manually in the Supabase SQL Editor:');
    console.log(alterTableSQL);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});