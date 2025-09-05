// Script to fix Ardian's level inconsistency between employees and survey_responses tables
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixArdianLevel() {
    console.log('🔧 Fixing Ardian\'s level inconsistency...');
    console.log('=' .repeat(50));
    
    try {
        // 1. Check current state
        console.log('\n1. Checking current state...');
        
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .select('*')
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (empError) {
            console.error('❌ Error fetching employee:', empError);
            return;
        }
        
        const { data: surveyResponse, error: surveyError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (surveyError) {
            console.error('❌ Error fetching survey response:', surveyError);
            return;
        }
        
        console.log('📋 Current employee level:', employee.level);
        console.log('📋 Current survey response level:', surveyResponse.level);
        
        // 2. Determine the correct level
        // Based on the screenshot showing Ardian as "Managerial" in the results,
        // and the survey response having "Managerial", we'll update the employee record
        const correctLevel = 'Managerial';
        
        console.log('\n2. Updating employee level to match survey response...');
        
        const { data: updatedEmployee, error: updateError } = await supabase
            .from('employees')
            .update({ level: correctLevel })
            .eq('id_badge_number', 'MTI240266')
            .select()
            .single();
            
        if (updateError) {
            console.error('❌ Error updating employee level:', updateError);
            return;
        }
        
        console.log('✅ Successfully updated employee level to:', updatedEmployee.level);
        
        // 3. Verify the fix
        console.log('\n3. Verifying the fix with JOIN query...');
        
        const { data: joinResult, error: joinError } = await supabase
            .from('survey_responses')
            .select(`
                name,
                id_badge_number,
                department,
                level,
                employees!inner(
                    level,
                    department,
                    name
                )
            `)
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (joinError) {
            console.error('❌ Error with JOIN query:', joinError);
            return;
        }
        
        console.log('✅ JOIN query successful!');
        console.log('📋 Survey response level:', joinResult.level);
        console.log('📋 Employee level (from JOIN):', joinResult.employees.level);
        console.log('📋 Levels match:', joinResult.level === joinResult.employees.level ? '✅ YES' : '❌ NO');
        
        // 4. Test the actual query used by SurveyResults component
        console.log('\n4. Testing SurveyResults query...');
        
        const { data: surveyData, error: surveyDataError } = await supabase
            .from("survey_responses")
            .select(`
                *,
                employees!inner(
                    level,
                    department,
                    name
                )
            `)
            .eq('id_badge_number', 'MTI240266')
            .order("created_at", { ascending: false });
            
        if (surveyDataError) {
            console.error('❌ Error with SurveyResults query:', surveyDataError);
            return;
        }
        
        console.log('✅ SurveyResults query successful!');
        console.log('📊 Found', surveyData?.length || 0, 'record(s) for Ardian');
        
        if (surveyData && surveyData.length > 0) {
            const record = surveyData[0];
            console.log('📋 Record details:');
            console.log('   - Name:', record.name);
            console.log('   - Badge:', record.id_badge_number);
            console.log('   - Department:', record.department);
            console.log('   - Survey Level:', record.level);
            console.log('   - Employee Level:', record.employees.level);
            console.log('   - Created:', new Date(record.created_at).toLocaleString());
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Level fix complete!');
}

// Run the fix function
fixArdianLevel().catch(console.error);