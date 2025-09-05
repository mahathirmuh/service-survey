const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wnpkmkqcwzgqxqvnvqzr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGtta3Fjd3pncXhxdm52cXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3OTc3NzcsImV4cCI6MjA1MTM3Mzc3N30.Ej2apnOCOXGvU2_bOmJIqKdJbLfCMhxtBf7wqhULMJo'
);

async function analyzeSyncIssue() {
  try {
    console.log('🔍 Analyzing data synchronization issue between Submission Status and Survey Results...');
    console.log('=' .repeat(80));
    
    // 1. Get all survey responses (what Submission.tsx counts)
    const { data: allResponses, error: allError } = await supabase
      .from('survey_responses')
      .select('id, id_badge_number, name, department, created_at');
    
    if (allError) throw allError;
    
    // 2. Get responses with INNER JOIN (what SurveyResults.tsx counts)
    const { data: responsesWithEmployees, error: innerError } = await supabase
      .from('survey_responses')
      .select(`
        id, id_badge_number, name, department, created_at,
        employees!inner(
          name,
          level,
          department
        )
      `);
    
    if (innerError) throw innerError;
    
    // 3. Get all employees for reference
    const { data: allEmployees, error: empError } = await supabase
      .from('employees')
      .select('id_badge_number, name, department, level');
    
    if (empError) throw empError;
    
    console.log('📊 COUNTS COMPARISON:');
    console.log(`   Total survey responses (Submission.tsx logic): ${allResponses?.length || 0}`);
    console.log(`   Responses with employees (SurveyResults.tsx logic): ${responsesWithEmployees?.length || 0}`);
    console.log(`   Total employees in database: ${allEmployees?.length || 0}`);
    console.log(`   Difference: ${(allResponses?.length || 0) - (responsesWithEmployees?.length || 0)}`);
    
    if (allResponses && responsesWithEmployees) {
      const allIds = new Set(allResponses.map(r => r.id));
      const matchedIds = new Set(responsesWithEmployees.map(r => r.id));
      const orphanedResponses = allResponses.filter(r => !matchedIds.has(r.id));
      
      if (orphanedResponses.length > 0) {
        console.log('\n🚨 ORPHANED SURVEY RESPONSES (no matching employee record):');
        orphanedResponses.forEach((r, index) => {
          console.log(`   ${index + 1}. ${r.name} (Badge: ${r.id_badge_number}) - Dept: ${r.department}`);
        });
        
        console.log('\n🔍 CHECKING IF THESE EMPLOYEES EXIST:');
        orphanedResponses.forEach((r, index) => {
          const employeeExists = allEmployees?.find(emp => emp.id_badge_number === r.id_badge_number);
          if (employeeExists) {
            console.log(`   ${index + 1}. ${r.name} - Employee EXISTS in database`);
          } else {
            console.log(`   ${index + 1}. ${r.name} - Employee NOT FOUND in database`);
          }
        });
      } else {
        console.log('\n✅ No orphaned responses found. All survey responses have matching employee records.');
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('🎯 SOLUTION RECOMMENDATION:');
    if ((allResponses?.length || 0) > (responsesWithEmployees?.length || 0)) {
      console.log('   Change SurveyResults.tsx to use LEFT JOIN instead of INNER JOIN');
      console.log('   This will include all survey responses, even those without employee records');
    } else {
      console.log('   Both queries return the same count - no synchronization issue detected');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing sync issue:', error);
  }
}

analyzeSyncIssue();