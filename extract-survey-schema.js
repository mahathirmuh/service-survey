// Script to extract survey_responses table schema from Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Old Supabase project credentials (from commit 8ef11f5ac56b7e3913b80b1a2cff3a2490d33ea4)
const oldSupabaseUrl = 'https://tbuuysrvoxhsgcuwmilk.supabase.co';
const oldSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidXV5c3J2b3hoc2djdXdtaWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTM4MjgsImV4cCI6MjA2Njk4OTgyOH0.bsR1gq8CWpOP_ceYgMGi_IksSltuvSkPMO0VpK_rBNM';

// Initialize Supabase client for old project
const oldSupabase = createClient(oldSupabaseUrl, oldSupabaseKey);

async function extractSurveyResponsesSchema() {
  try {
    console.log('Extracting survey_responses table schema from old Supabase project...');
    
    // Get a sample row to determine the structure
    const { data, error } = await oldSupabase
      .from('survey_responses')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No data found in survey_responses table to extract schema.');
      return;
    }
    
    // Extract column names and infer types from the sample data
    const sampleRow = data[0];
    const columns = [];
    
    for (const [columnName, value] of Object.entries(sampleRow)) {
      let dataType = typeof value;
      
      // Convert JavaScript types to PostgreSQL types
      switch (dataType) {
        case 'string':
          dataType = 'text';
          break;
        case 'number':
          dataType = Number.isInteger(value) ? 'integer' : 'numeric';
          break;
        case 'boolean':
          dataType = 'boolean';
          break;
        case 'object':
          if (value === null) {
            // For null values, we can't determine the type
            dataType = 'text'; // Default to text
          } else if (Array.isArray(value)) {
            dataType = 'jsonb';
          } else if (value instanceof Date) {
            dataType = 'timestamp with time zone';
          } else {
            dataType = 'jsonb';
          }
          break;
        default:
          dataType = 'text';
      }
      
      columns.push({
        column_name: columnName,
        data_type: dataType,
        is_nullable: 'YES' // Assume nullable by default
      });
    }
    
    console.log(`Found ${columns.length} columns in survey_responses table.`);
    console.table(columns);
    
    // Generate SQL to recreate the table
    let createTableSQL = `CREATE TABLE IF NOT EXISTS public.survey_responses (
`;
    
    // Add columns
    const columnDefinitions = columns.map(column => {
      let columnDef = `  ${column.column_name} ${column.data_type}`;
      
      // Add nullable constraint
      columnDef += column.is_nullable === 'YES' ? '' : ' NOT NULL';
      
      return columnDef;
    });
    
    createTableSQL += columnDefinitions.join(',\n');
    createTableSQL += '\n);';
    
    // Generate SQL to add columns to existing table
    let alterTableSQL = `-- Add all columns to survey_responses table
ALTER TABLE public.survey_responses 
`;
    
    const alterColumns = columns.map(column => {
      let columnDef = `ADD COLUMN IF NOT EXISTS ${column.column_name} ${column.data_type}`;
      return columnDef;
    });
    
    alterTableSQL += alterColumns.join(',\n');
    alterTableSQL += ';';
    
    // Write SQL to files
    fs.writeFileSync('survey_responses_create.sql', createTableSQL);
    fs.writeFileSync('survey_responses_alter.sql', alterTableSQL);
    
    console.log('\nGenerated SQL files:');
    console.log('1. survey_responses_create.sql - SQL to create the table from scratch');
    console.log('2. survey_responses_alter.sql - SQL to add columns to existing table');
    
  } catch (error) {
    console.error('Error extracting schema:', error.message);
  }
}

// Execute the function
extractSurveyResponsesSchema();