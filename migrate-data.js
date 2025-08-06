#!/usr/bin/env node

/**
 * Data Migration Script
 * 
 * This script migrates data from the old Supabase project to the new one.
 * It exports all employees and survey responses from the old project
 * and imports them into the new project.
 */

import { createClient } from '@supabase/supabase-js';

// Old project credentials
const oldSupabase = createClient(
  'https://tbuuysrvoxhsgcuwmilk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidXV5c3J2b3hoc2djdXdtaWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTM4MjgsImV4cCI6MjA2Njk4OTgyOH0.bsR1gq8CWpOP_ceYgMGi_IksSltuvSkPMO0VpK_rBNM'
);

// New project credentials
const newSupabase = createClient(
  'https://hkaqjeofgzqcuudvgdgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYXFqZW9mZ3pxY3V1ZHZnZGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzA5ODUsImV4cCI6MjA3MDA0Njk4NX0.wdK5dS8MytGIjf9UihrYkqWMYGdJcPaMfmE5NlittTI'
);

async function migrateEmployees() {
  console.log('🔄 Migrating employees...');
  
  try {
    // Check if employees already exist in new project
    const { count: existingCount, error: countError } = await newSupabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error checking existing employees:', countError);
      return false;
    }
    
    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} employees already in new project, skipping employee migration`);
      return true;
    }
    
    // Export employees from old project
    const { data: employees, error: exportError } = await oldSupabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (exportError) {
      console.error('❌ Error exporting employees:', exportError);
      return false;
    }
    
    if (!employees || employees.length === 0) {
      console.log('ℹ️  No employees found in old project');
      return true;
    }
    
    console.log(`📊 Found ${employees.length} employees to migrate`);
    
    // Import employees to new project
    const { data: importedEmployees, error: importError } = await newSupabase
      .from('employees')
      .insert(employees)
      .select();
    
    if (importError) {
      console.error('❌ Error importing employees:', importError);
      return false;
    }
    
    console.log(`✅ Successfully migrated ${importedEmployees.length} employees`);
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during employee migration:', error);
    return false;
  }
}

async function getTableSchema(supabaseClient, tableName) {
  try {
    // Get a sample record to understand the schema
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If no data, try to get schema from an empty insert attempt
    if (!data || data.length === 0) {
      const { error: schemaError } = await supabaseClient
        .from(tableName)
        .insert({});
      
      if (schemaError && schemaError.message) {
        // Parse column names from error message if possible
        return [];
      }
    }
    
    return data && data.length > 0 ? Object.keys(data[0]) : [];
  } catch (error) {
    console.warn(`⚠️  Could not determine schema for ${tableName}:`, error.message);
    return [];
  }
}

async function migrateSurveyResponses() {
  console.log('🔄 Migrating survey responses...');
  
  try {
    // Check if survey responses already exist in new project
    const { count: existingResponseCount, error: responseCountError } = await newSupabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true });
    
    if (responseCountError) {
      console.error('❌ Error checking existing survey responses:', responseCountError);
      return false;
    }
    
    if (existingResponseCount > 0) {
      console.log(`ℹ️  Found ${existingResponseCount} survey responses already in new project, skipping survey response migration`);
      return true;
    }
    
    // Get schema from both projects
    console.log('🔍 Analyzing table schemas...');
    
    // Export survey responses from old project
    const { data: responses, error: exportError } = await oldSupabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (exportError) {
      console.error('❌ Error exporting survey responses:', exportError);
      return false;
    }
    
    if (!responses || responses.length === 0) {
      console.log('ℹ️  No survey responses found in old project');
      return true;
    }
    
    console.log(`📊 Found ${responses.length} survey responses to migrate`);
    
    // Since we know the schema from our migrations, use the expected columns
    // This is more reliable than trying to detect the schema dynamically
    const newProjectColumns = [
      'id', 'name', 'id_badge_number', 'department', 'created_at', 'updated_at',
      'dept1_section', 'dept2_section',
      // Add all the section columns from migrations
      'dept1_section1_question1', 'dept1_section1_question2', 'dept1_section1_question3', 'dept1_section1_feedback',
      'dept1_section2_question1', 'dept1_section2_question2', 'dept1_section2_question3', 'dept1_section2_feedback',
      'dept1_section3_question1', 'dept1_section3_question2', 'dept1_section3_question3', 'dept1_section3_feedback',
      'dept1_section4_question1', 'dept1_section4_question2', 'dept1_section4_question3', 'dept1_section4_feedback',
      'dept1_section5_question1', 'dept1_section5_question2', 'dept1_section5_question3', 'dept1_section5_feedback',
      'dept2_section1_question1', 'dept2_section1_question2', 'dept2_section1_question3', 'dept2_section1_feedback',
      'dept2_section2_question1', 'dept2_section2_question2', 'dept2_section2_question3', 'dept2_section2_feedback',
      'dept2_section3_question1', 'dept2_section3_question2', 'dept2_section3_question3', 'dept2_section3_feedback',
      'dept2_section4_question1', 'dept2_section4_question2', 'dept2_section4_question3', 'dept2_section4_feedback',
      'dept2_section5_question1', 'dept2_section5_question2', 'dept2_section5_question3', 'dept2_section5_feedback',
      // HR columns
      'hr_documentcontrol_question1', 'hr_documentcontrol_question2', 'hr_documentcontrol_question3', 'hr_documentcontrol_feedback',
      'hr_itsupport_question1', 'hr_itsupport_question2', 'hr_itsupport_question3', 'hr_itsupport_feedback',
      // Environmental columns
      'environmental_team1_question1', 'environmental_team1_question2', 'environmental_team1_question3', 'environmental_team1_feedback',
      'environmental_team2_question1', 'environmental_team2_question2', 'environmental_team2_question3', 'environmental_team2_feedback',
      // Finance columns
      'finance_finance_question1', 'finance_finance_question2', 'finance_finance_question3', 'finance_finance_feedback',
      'finance_contract_question1', 'finance_contract_question2', 'finance_contract_question3', 'finance_contract_feedback',
      'finance_costcontrol_question1', 'finance_costcontrol_question2', 'finance_costcontrol_question3', 'finance_costcontrol_feedback',
      // External columns
      'external_communityrelations_question1', 'external_communityrelations_question2', 'external_communityrelations_question3', 'external_communityrelations_feedback'
    ];
    
    console.log(`🔍 New project has ${newProjectColumns.length} columns`);
    
    // Filter responses to only include columns that exist in the new project
    const filteredResponses = responses.map(response => {
      const filteredResponse = {};
      
      // Only include columns that exist in the new project
      for (const column of newProjectColumns) {
        if (response.hasOwnProperty(column)) {
          filteredResponse[column] = response[column];
        }
      }
      
      // Remove the id to let the new project generate new UUIDs
      delete filteredResponse.id;
      
      return filteredResponse;
    });
    
    console.log(`🔄 Filtered responses to match new schema`);
    
    // Import survey responses to new project in batches
    const batchSize = 100;
    let totalImported = 0;
    
    for (let i = 0; i < filteredResponses.length; i += batchSize) {
      const batch = filteredResponses.slice(i, i + batchSize);
      
      const { data: importedResponses, error: importError } = await newSupabase
        .from('survey_responses')
        .insert(batch)
        .select();
      
      if (importError) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, importError);
        console.error('Sample record causing error:', JSON.stringify(batch[0], null, 2));
        return false;
      }
      
      totalImported += importedResponses.length;
      console.log(`📈 Imported batch ${Math.floor(i/batchSize) + 1}: ${importedResponses.length} responses`);
    }
    
    console.log(`✅ Successfully migrated ${totalImported} survey responses`);
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during survey response migration:', error);
    return false;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    // Check employee count in new project
    const { count: newEmployeeCount, error: employeeError } = await newSupabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    
    if (employeeError) {
      console.error('❌ Error counting employees in new project:', employeeError);
      return false;
    }
    
    // Check survey response count in new project
    const { count: newResponseCount, error: responseError } = await newSupabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true });
    
    if (responseError) {
      console.error('❌ Error counting survey responses in new project:', responseError);
      return false;
    }
    
    console.log('📊 Migration Summary:');
    console.log(`   Employees in new project: ${newEmployeeCount}`);
    console.log(`   Survey responses in new project: ${newResponseCount}`);
    
    // Test a sample query to ensure data integrity
    const { data: sampleEmployee, error: sampleError } = await newSupabase
      .from('employees')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('❌ Error testing sample query:', sampleError);
      return false;
    }
    
    if (sampleEmployee) {
      console.log(`✅ Sample employee found: ${sampleEmployee.name} (${sampleEmployee.department})`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
    return false;
  }
}

async function testNewProjectConnection() {
  console.log('🔗 Testing connection to new project...');
  
  try {
    const { data, error } = await newSupabase
      .from('employees')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Connection to new project successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase Data Migration');
  console.log('====================================\n');
  
  // Test connection to new project
  const connectionOk = await testNewProjectConnection();
  if (!connectionOk) {
    console.log('❌ Migration aborted due to connection failure');
    process.exit(1);
  }
  
  console.log('');
  
  // Migrate employees first (required for foreign key constraints)
  const employeesOk = await migrateEmployees();
  if (!employeesOk) {
    console.log('❌ Migration aborted due to employee migration failure');
    process.exit(1);
  }
  
  console.log('');
  
  // Migrate survey responses
  const responsesOk = await migrateSurveyResponses();
  if (!responsesOk) {
    console.log('❌ Migration aborted due to survey response migration failure');
    process.exit(1);
  }
  
  console.log('');
  
  // Verify migration
  const verificationOk = await verifyMigration();
  if (!verificationOk) {
    console.log('⚠️  Migration completed but verification failed');
    process.exit(1);
  }
  
  console.log('');
  console.log('🎉 Migration completed successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Test your application: npm run dev');
  console.log('   2. Verify all functionality works correctly');
  console.log('   3. Update any production environment variables');
  console.log('   4. Consider deactivating the old project once confirmed');
}

// Run the migration
main().catch(error => {
  console.error('💥 Migration failed with unexpected error:', error);
  process.exit(1);
});