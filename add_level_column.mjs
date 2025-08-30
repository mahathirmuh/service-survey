// Script to add level column to survey_responses table and sync data
// This script directly executes SQL to add the missing level column

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addLevelColumnAndSync() {
  try {
    console.log('🔧 Adding level column to survey_responses table...');
    
    // Add level column with default value and constraint
    const addColumnQuery = `
      ALTER TABLE public.survey_responses 
      ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Non Managerial'
    CHECK (level IN ('Managerial', 'Non Managerial'));
    `;
    
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: addColumnQuery
    });
    
    if (addColumnError) {
      console.error('❌ Error adding level column:', addColumnError);
      // Try alternative approach using direct SQL execution
      console.log('🔄 Trying alternative approach...');
      
      const { error: altError } = await supabase
        .from('survey_responses')
        .select('id')
        .limit(1);
      
      if (altError) {
        console.error('❌ Cannot access survey_responses table:', altError);
        return;
      }
    } else {
      console.log('✅ Level column added successfully');
    }
    
    // Create index for performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS IX_survey_responses_level ON public.survey_responses(level);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexQuery
    });
    
    if (indexError) {
      console.log('⚠️  Could not create index (this is optional):', indexError.message);
    } else {
      console.log('✅ Index created successfully');
    }
    
    console.log('🔄 Now syncing survey response levels with employee levels...');
    
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
    
    // Verify the sync by checking a few records
    const { data: sampleRecords, error: sampleError } = await supabase
      .from('survey_responses')
      .select('id_badge_number, name, level')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Error fetching sample records:', sampleError);
    } else {
      console.log('\n📋 Sample Records After Sync:');
      sampleRecords.forEach(record => {
        console.log(`✅ ${record.name} (${record.id_badge_number}): Level = ${record.level}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the script
addLevelColumnAndSync();