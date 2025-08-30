// Manual sync script to update survey response levels
// This script uses the Supabase client to sync levels

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSurveyResponseLevels() {
  try {
    console.log('🔄 Starting survey response level synchronization...');
    
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
      }
    }
    
    console.log('🎉 Synchronization completed!');
    
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