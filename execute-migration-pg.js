import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Database connection configuration
const dbConfig = {
  host: 'db.uwbqdiwuczhorzdzdlqp.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'T$1ngsh4n@24', // Admin password
  ssl: {
    rejectUnauthorized: false
  }
};

// Read the SQL file
const sqlFilePath = path.resolve('./add-missing-columns.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Extract just the ALTER TABLE statement (without the verification query)
const alterTableSQL = sqlContent.split('-- Verify columns were added')[0].trim();

/**
 * Execute SQL using direct PostgreSQL connection
 */
async function executeSQLWithPG() {
  console.log('Executing SQL using direct PostgreSQL connection...');
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Execute the ALTER TABLE statement
    await client.query(alterTableSQL);
    
    console.log('SQL executed successfully!');
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  } finally {
    await client.end();
    console.log('Disconnected from PostgreSQL database');
  }
}

/**
 * Verify if the columns exist
 */
async function verifyColumns() {
  console.log('Verifying if columns were added...');
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    // Query to check if the columns exist
    const query = `
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
    
    const result = await client.query(query);
    
    if (result.rows.length === 3) {
      console.log('Columns verified successfully:');
      result.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
      });
      return true;
    } else {
      console.log('Columns verification failed. Found columns:');
      result.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
      });
      return false;
    }
  } catch (error) {
    console.error('Error verifying columns:', error);
    return false;
  } finally {
    await client.end();
  }
}

/**
 * Run the import script
 */
async function runImportScript() {
  console.log('Running import script...');
  
  try {
    execSync('node import-to-new-project.js', { stdio: 'inherit' });
    console.log('Import completed successfully!');
    return true;
  } catch (error) {
    console.error('Error running import script:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting migration process with admin credentials...');
  
  // Execute SQL
  const sqlSuccess = await executeSQLWithPG();
  
  if (sqlSuccess) {
    console.log('Migration executed successfully!');
    
    // Verify columns
    const columnsExist = await verifyColumns();
    
    if (columnsExist) {
      console.log('Columns added and verified successfully!');
      
      // Run import script
      const importSuccess = await runImportScript();
      
      if (importSuccess) {
        console.log('Migration and import completed successfully!');
        console.log('Next steps:');
        console.log('   1. Verify data in Supabase dashboard');
        console.log('   2. Test application functionality');
      } else {
        console.log('Migration completed but import failed.');
        console.log('Please run the import script manually:');
        console.log('   node import-to-new-project.js');
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