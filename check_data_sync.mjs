// Script to check the current data synchronization status
// This will help us understand what needs to be synced

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDataSync() {
  try {
    console.log('🔍 Checking current data synchronization status...');
    
    // Get all employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .order('id_badge_number');
    
    if (employeesError) {
      console.error('❌ Error fetching employees:', employeesError);
      return;
    }
    
    console.log(`\n📊 Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`  ${emp.name} (${emp.id_badge_number}) - Department: ${emp.department}, Level: ${emp.level}`);
    });
    
    // Get all survey responses
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('id, name, id_badge_number, department, created_at')
      .order('id_badge_number');
    
    if (responsesError) {
      console.error('❌ Error fetching survey responses:', responsesError);
      return;
    }
    
    console.log(`\n📋 Found ${responses.length} survey responses:`);
    responses.forEach(resp => {
      console.log(`  ${resp.name} (${resp.id_badge_number}) - Department: ${resp.department}, Submitted: ${new Date(resp.created_at).toLocaleDateString()}`);
    });
    
    // Check for mismatches
    console.log('\n🔍 Checking for data mismatches...');
    
    const employeeMap = new Map();
    employees.forEach(emp => {
      employeeMap.set(emp.id_badge_number, emp);
    });
    
    let mismatches = [];
    responses.forEach(resp => {
      const employee = employeeMap.get(resp.id_badge_number);
      if (employee) {
        if (employee.name !== resp.name) {
          mismatches.push({
            id_badge_number: resp.id_badge_number,
            type: 'name',
            employee_value: employee.name,
            response_value: resp.name
          });
        }
        if (employee.department !== resp.department) {
          mismatches.push({
            id_badge_number: resp.id_badge_number,
            type: 'department',
            employee_value: employee.department,
            response_value: resp.department
          });
        }
      } else {
        mismatches.push({
          id_badge_number: resp.id_badge_number,
          type: 'missing_employee',
          employee_value: null,
          response_value: 'Survey response exists but no employee record'
        });
      }
    });
    
    if (mismatches.length === 0) {
      console.log('✅ No data mismatches found! All data is synchronized.');
    } else {
      console.log(`⚠️  Found ${mismatches.length} data mismatches:`);
      mismatches.forEach(mismatch => {
        console.log(`  ${mismatch.id_badge_number} - ${mismatch.type}: Employee='${mismatch.employee_value}' vs Survey='${mismatch.response_value}'`);
      });
    }
    
    // Check for employees without survey responses
    console.log('\n🔍 Checking for employees without survey responses...');
    const responseMap = new Map();
    responses.forEach(resp => {
      responseMap.set(resp.id_badge_number, resp);
    });
    
    const employeesWithoutResponses = employees.filter(emp => !responseMap.has(emp.id_badge_number));
    
    if (employeesWithoutResponses.length === 0) {
      console.log('✅ All employees have submitted survey responses.');
    } else {
      console.log(`📝 ${employeesWithoutResponses.length} employees have not submitted survey responses:`);
      employeesWithoutResponses.forEach(emp => {
        console.log(`  ${emp.name} (${emp.id_badge_number}) - ${emp.department}, Level: ${emp.level}`);
      });
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`  Total Employees: ${employees.length}`);
    console.log(`  Total Survey Responses: ${responses.length}`);
    console.log(`  Data Mismatches: ${mismatches.length}`);
    console.log(`  Employees without responses: ${employeesWithoutResponses.length}`);
    
    if (mismatches.length > 0) {
      console.log('\n💡 To fix data mismatches, you would need database admin access to update the survey_responses table.');
      console.log('💡 The main issue appears to be that the survey_responses table lacks a "level" column for tracking employee levels.');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the check
checkDataSync();