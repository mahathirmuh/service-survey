// Data Synchronization Solution
// This script provides a workaround for level tracking without modifying the database schema

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get survey responses with employee levels (using JOIN)
async function getSurveyResponsesWithLevels() {
  try {
    console.log('🔍 Fetching survey responses with employee levels...');
    
    // Use a JOIN query to get survey responses with employee levels
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        employees!inner(
          level,
          department,
          name
        )
      `);
    
    if (error) {
      console.error('❌ Error fetching survey responses with levels:', error);
      return null;
    }
    
    console.log(`✅ Found ${data.length} survey responses with employee data:`);
    data.forEach(response => {
      console.log(`  ${response.name} (${response.id_badge_number}) - Level: ${response.employees.level}, Department: ${response.employees.department}`);
    });
    
    return data;
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return null;
  }
}

// Function to get analytics data by level
async function getAnalyticsByLevel() {
  try {
    console.log('\n📊 Generating analytics by employee level...');
    
    const responsesWithLevels = await getSurveyResponsesWithLevels();
    if (!responsesWithLevels) return;
    
    // Group by level
    const analytics = {
      Managerial: [],
      'Non Managerial': []
    };
    
    responsesWithLevels.forEach(response => {
      const level = response.employees.level;
      if (analytics[level]) {
        analytics[level].push(response);
      }
    });
    
    console.log('\n📈 Analytics Summary:');
    console.log(`  Managerial Responses: ${analytics.Managerial.length}`);
    console.log(`  Non Managerial Responses: ${analytics['Non Managerial'].length}`);
    
    // Calculate completion rates
    const { data: employees, error } = await supabase
      .from('employees')
      .select('level');
    
    if (!error && employees) {
      const managerialEmployees = employees.filter(emp => emp.level === 'Managerial').length;
      const nonManagerialEmployees = employees.filter(emp => emp.level === 'Non Managerial').length;
      
      const managerialRate = managerialEmployees > 0 ? (analytics.Managerial.length / managerialEmployees * 100).toFixed(1) : 0;
      const nonManagerialRate = nonManagerialEmployees > 0 ? (analytics['Non Managerial'].length / nonManagerialEmployees * 100).toFixed(1) : 0;
      
      console.log('\n📊 Completion Rates:');
      console.log(`  Managerial: ${analytics.Managerial.length}/${managerialEmployees} (${managerialRate}%)`);
      console.log(`  Non Managerial: ${analytics['Non Managerial'].length}/${nonManagerialEmployees} (${nonManagerialRate}%)`);
    }
    
    return analytics;
  } catch (error) {
    console.error('💥 Error generating analytics:', error);
  }
}

// Function to create a database view (requires admin access)
function generateViewSQL() {
  const viewSQL = `
-- SQL to create a view that includes employee levels with survey responses
-- This requires database admin access to execute

CREATE OR REPLACE VIEW survey_responses_with_levels AS
SELECT 
  sr.*,
  e.level as employee_level,
  e.department as employee_department
FROM survey_responses sr
INNER JOIN employees e ON sr.id_badge_number = e.id_badge_number;

-- Grant access to the view
GRANT SELECT ON survey_responses_with_levels TO anon;
GRANT SELECT ON survey_responses_with_levels TO authenticated;
`;
  
  console.log('\n🔧 SQL to create a view (requires admin access):');
  console.log(viewSQL);
  
  return viewSQL;
}

// Function to update React components to use JOIN queries
function generateReactSolution() {
  const reactCode = `
// Updated React hook to fetch survey responses with employee levels
// Add this to your React components

const useSurveyResponsesWithLevels = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch survey responses with employee data using JOIN
        const { data: responses, error } = await supabase
          .from('survey_responses')
          .select(\`
            *,
            employees!inner(
              level,
              department,
              name
            )
          \`);
        
        if (error) throw error;
        
        // Transform data to include level directly
        const transformedData = responses.map(response => ({
          ...response,
          level: response.employees.level,
          employee_department: response.employees.department
        }));
        
        setData(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, loading, error };
};

// Usage in your dashboard components:
// const { data: surveyResponses } = useSurveyResponsesWithLevels();
// const managerialResponses = surveyResponses.filter(r => r.level === 'Managerial');
// const nonManagerialResponses = surveyResponses.filter(r => r.level === 'Non Managerial');
`;
  
  console.log('\n⚛️  React solution (update your components):');
  console.log(reactCode);
  
  return reactCode;
}

// Main execution
async function main() {
  console.log('🚀 Data Synchronization Solution');
  console.log('================================\n');
  
  // Check current data with levels
  await getSurveyResponsesWithLevels();
  
  // Generate analytics
  await getAnalyticsByLevel();
  
  // Provide solutions
  console.log('\n💡 SOLUTIONS:');
  console.log('=============');
  
  console.log('\n1. Database View Solution (Requires Admin Access):');
  generateViewSQL();
  
  console.log('\n2. React Application Solution (No DB changes needed):');
  generateReactSolution();
  
  console.log('\n✅ RECOMMENDATION:');
  console.log('Use the React solution to fetch survey responses with employee levels using JOIN queries.');
  console.log('This avoids the need to modify the database schema and works with current permissions.');
  console.log('\nThe data is already synchronized - the main issue is tracking employee levels in survey analytics.');
}

// Run the solution
main();