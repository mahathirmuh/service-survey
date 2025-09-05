// Test script to verify data joining functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Connecting to Supabase:', supabaseUrl);

async function testDataJoining() {
  console.log('🔍 Testing data joining functionality...');
  
  try {
    // Test 1: Fetch survey responses (manual approach like in SurveyResults.tsx)
    console.log('\n📊 Step 1: Fetching survey responses...');
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (surveyError) {
      console.error('❌ Error fetching survey responses:', surveyError);
      return;
    }
    
    console.log(`✅ Found ${surveyData?.length || 0} survey responses`);
    
    // Test 2: Manual JOIN implementation (like in SurveyResults.tsx)
    console.log('\n🔗 Step 2: Performing manual JOIN with employees...');
    const enrichedSurveyData = [];
    
    for (const response of surveyData || []) {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('level, department, name, email')
        .eq('id_badge_number', response.id_badge_number)
        .single();
      
      enrichedSurveyData.push({
        ...response,
        employees: employeeData || null
      });
      
      console.log(`  📋 Survey ID: ${response.id}`);
      console.log(`     Badge: ${response.id_badge_number}`);
      console.log(`     Survey Name: ${response.name}`);
      console.log(`     Survey Dept: ${response.department}`);
      console.log(`     Survey Level: ${response.level || 'Not set'}`);
      
      if (employeeData) {
        console.log(`     ✅ Employee Match Found:`);
        console.log(`        Employee Name: ${employeeData.name}`);
        console.log(`        Employee Level: ${employeeData.level}`);
        console.log(`        Employee Dept: ${employeeData.department}`);
        console.log(`        Employee Email: ${employeeData.email || 'Not set'}`);
      } else {
        console.log(`     ⚠️  No matching employee found`);
      }
      console.log('     ---');
    }
    
    // Test 3: Verify data consistency
    console.log('\n🔍 Step 3: Analyzing data consistency...');
    const responsesWithEmployeeMatch = enrichedSurveyData.filter(r => r.employees).length;
    const responsesWithoutEmployeeMatch = enrichedSurveyData.filter(r => !r.employees).length;
    
    console.log(`✅ Responses with employee match: ${responsesWithEmployeeMatch}`);
    console.log(`⚠️  Responses without employee match: ${responsesWithoutEmployeeMatch}`);
    
    // Test 4: Level distribution
    const levelCounts = enrichedSurveyData.reduce((acc, response) => {
      const level = response.employees?.level || response.level || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Level distribution:');
    Object.entries(levelCounts).forEach(([level, count]) => {
      console.log(`   ${level}: ${count}`);
    });
    
    console.log('\n✅ Data joining test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data joining test:', error);
  }
}

// Run the test
testDataJoining();