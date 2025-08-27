// Script to verify the migration was successful
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('Verifying migration...');
  
  try {
    // Verify employees table
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('count(*)');
    
    if (employeesError) {
      console.error('Error fetching employees:', employeesError.message);
    } else {
      console.log(`Employees table has ${employees[0].count} records`);
    }
    
    // Verify survey_responses table
    const { data: surveyResponses, error: surveyResponsesError } = await supabase
      .from('survey_responses')
      .select('count(*)');
    
    if (surveyResponsesError) {
      console.error('Error fetching survey responses:', surveyResponsesError.message);
    } else {
      console.log(`Survey responses table has ${surveyResponses[0].count} records`);
    }
    
    // Verify SCM columns exist in survey_responses
    const { data: scmColumns, error: scmColumnsError } = await supabase
      .rpc('exec_sql', {
        sql_string: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'survey_responses' 
          AND column_name LIKE 'scm_%'
        `
      });
    
    if (scmColumnsError) {
      console.error('Error checking SCM columns:', scmColumnsError.message);
    } else {
      console.log(`Found ${scmColumns.length} SCM columns in survey_responses table`);
      scmColumns.forEach(col => console.log(`- ${col.column_name}`));
    }
    
    // Verify HR columns exist in survey_responses
    const { data: hrColumns, error: hrColumnsError } = await supabase
      .rpc('exec_sql', {
        sql_string: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'survey_responses' 
          AND column_name LIKE 'hr_%'
        `
      });
    
    if (hrColumnsError) {
      console.error('Error checking HR columns:', hrColumnsError.message);
    } else {
      console.log(`Found ${hrColumns.length} HR columns in survey_responses table`);
      hrColumns.forEach(col => console.log(`- ${col.column_name}`));
    }
    
    // Verify environmental columns exist in survey_responses
    const { data: envColumns, error: envColumnsError } = await supabase
      .rpc('exec_sql', {
        sql_string: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'survey_responses' 
          AND column_name LIKE 'environmental_%'
        `
      });
    
    if (envColumnsError) {
      console.error('Error checking environmental columns:', envColumnsError.message);
    } else {
      console.log(`Found ${envColumns.length} environmental columns in survey_responses table`);
      envColumns.forEach(col => console.log(`- ${col.column_name}`));
    }
    
    // Verify external columns exist in survey_responses
    const { data: extColumns, error: extColumnsError } = await supabase
      .rpc('exec_sql', {
        sql_string: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'survey_responses' 
          AND column_name LIKE 'external_%'
        `
      });
    
    if (extColumnsError) {
      console.error('Error checking external columns:', extColumnsError.message);
    } else {
      console.log(`Found ${extColumns.length} external columns in survey_responses table`);
      extColumns.forEach(col => console.log(`- ${col.column_name}`));
    }
    
    // Verify a sample survey response has data in SCM columns
    const { data: sampleResponse, error: sampleResponseError } = await supabase
      .from('survey_responses')
      .select('scm_inventory_question1, scm_inventory_question2, scm_inventory_feedback')
      .limit(1);
    
    if (sampleResponseError) {
      console.error('Error fetching sample response:', sampleResponseError.message);
    } else if (sampleResponse.length > 0) {
      console.log('Sample survey response SCM data:', sampleResponse[0]);
    } else {
      console.log('No survey responses found');
    }
    
    console.log('\nMigration verification complete!');
  } catch (error) {
    console.error('Unexpected error during verification:', error);
  }
}

// Run the verification
verifyMigration();