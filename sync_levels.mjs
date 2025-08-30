// Manual sync script to update survey response levels
// This script uses the Supabase client to sync levels

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking survey_responses table structure...');
    
    // Try to get a sample record to see the actual columns
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching sample record:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Available columns:', Object.keys(data[0]));
      return Object.keys(data[0]);
    } else {
      console.log('📋 No records found in survey_responses table');
      return [];
    }
  } catch (error) {
    console.error('💥 Error checking table structure:', error);
    return null;
  }
}

async function syncSurveyResponseLevels() {
  try {
    console.log('🔄 Starting survey response level synchronization...');
    
    // First check the table structure
    const columns = await checkTableStructure();
    if (!columns) {
      console.error('❌ Could not determine table structure');
      return;
    }
    
    const hasLevelColumn = columns.includes('level');
    console.log(`📊 Level column exists: ${hasLevelColumn}`);
    
    if (!hasLevelColumn) {
      console.log('⚠️  Level column does not exist in survey_responses table');
      console.log('💡 This means the migration to add the level column has not been applied yet.');
      console.log('🔧 You need to apply the migration: 20250120000001_add_level_to_survey_responses.sql');
      return;
    }
    
    // Get all employees with their current levels
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id_badge_number, level');
    
    if (employeesError) {
      console.error('❌ Error fetching employees:', employeesError);
      return;
    }
    
    console.log(`📊 Found ${employees.length} employees`);
    
    // Update survey responses for each employee
    let updatedCount = 0;
    for (const employee of employees) {
      const { data, error } = await supabase
        .from('survey_responses')
        .update({ level: employee.level })
        .eq('id_badge_number', employee.id_badge_number)
        .select();
      
      if (error) {
        console.error(`❌ Error updating ${employee.id_badge_number}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${data.length} survey response(s) for ${employee.id_badge_number} to level: ${employee.level}`);
        updatedCount += data.length;
      }
    }
    
    console.log(`🎉 Synchronization completed! Updated ${updatedCount} survey responses.`);
    
    // Verify the sync
    const { data: verification, error: verifyError } = await supabase
      .from('survey_responses')
      .select(`
        id_badge_number,
        name,
        level,
        employees!inner(level)
      `);
    
    if (verifyError) {
      console.error('❌ Error verifying sync:', verifyError);
    } else {
      console.log('\n📋 Verification Results:');
      verification.forEach(response => {
        const isSync = response.level === response.employees.level;
        console.log(`${isSync ? '✅' : '❌'} ${response.name} (${response.id_badge_number}): Survey=${response.level}, Employee=${response.employees.level}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the sync
syncSurveyResponseLevels();