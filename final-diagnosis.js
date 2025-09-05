// Final diagnosis to understand what's happening with Ardian's record
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function finalDiagnosis() {
    console.log('🔍 Final diagnosis of Ardian\'s record...');
    console.log('=' .repeat(50));
    
    try {
        // 1. Get ALL survey responses to see what's there
        console.log('\n1. Getting ALL survey responses...');
        const { data: allResponses, error: allError } = await supabase
            .from('survey_responses')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (allError) {
            console.error('❌ Error getting all responses:', allError);
            return;
        }
        
        console.log(`✅ Total survey responses: ${allResponses?.length || 0}`);
        allResponses?.forEach((response, index) => {
            console.log(`   ${index + 1}. ${response.name} (${response.id_badge_number}) - employee_id: ${response.employee_id || 'NULL'}`);
        });
        
        // 2. Check if Ardian's record exists
        const ardianResponse = allResponses?.find(r => r.id_badge_number === 'MTI240266');
        if (!ardianResponse) {
            console.log('\n❌ CRITICAL: Ardian\'s survey response not found!');
            console.log('This means the record was deleted or never existed.');
            return;
        }
        
        console.log('\n✅ Ardian\'s record found:');
        console.log('   - ID:', ardianResponse.id);
        console.log('   - Name:', ardianResponse.name);
        console.log('   - Badge:', ardianResponse.id_badge_number);
        console.log('   - Employee ID:', ardianResponse.employee_id || 'NULL');
        console.log('   - Level:', ardianResponse.level);
        console.log('   - Department:', ardianResponse.department);
        console.log('   - Created:', ardianResponse.created_at);
        
        // 3. Try to update using the actual record ID
        console.log('\n3. Attempting update using record ID...');
        const employeeId = '3670c920-e378-4680-9020-d18dd0241aea';
        
        const { data: updateResult, error: updateError } = await supabase
            .from('survey_responses')
            .update({ employee_id: employeeId })
            .eq('id', ardianResponse.id)
            .select('*');
            
        if (updateError) {
            console.error('❌ Update by ID failed:', updateError);
        } else {
            console.log('✅ Update by ID successful!');
            console.log('Updated records:', updateResult?.length || 0);
            updateResult?.forEach(record => {
                console.log(`   - ${record.name}: employee_id now ${record.employee_id}`);
            });
        }
        
        // 4. Final verification with JOIN
        console.log('\n4. Final JOIN verification...');
        const { data: joinResult, error: joinError } = await supabase
            .from('survey_responses')
            .select(`
                id,
                name,
                id_badge_number,
                level,
                department,
                employee_id,
                employees!inner(
                    id,
                    level,
                    department,
                    name
                )
            `)
            .order('created_at', { ascending: false });
            
        if (joinError) {
            console.error('❌ Final JOIN failed:', joinError);
        } else {
            console.log(`✅ Final JOIN successful! Records: ${joinResult?.length || 0}`);
            
            joinResult?.forEach((record, index) => {
                console.log(`\n   ${index + 1}. Survey Response:`);
                console.log(`      - Name: ${record.name} (${record.id_badge_number})`);
                console.log(`      - Survey Level: ${record.level}`);
                console.log(`      - Employee ID: ${record.employee_id}`);
                console.log(`      - Employee Data:`);
                console.log(`        - Name: ${record.employees.name}`);
                console.log(`        - Level: ${record.employees.level}`);
                console.log(`        - Department: ${record.employees.department}`);
                console.log(`      - Levels Match: ${record.level === record.employees.level ? '✅' : '❌'}`);
            });
            
            // Check for Ardian specifically
            const ardianInJoin = joinResult?.find(r => r.id_badge_number === 'MTI240266');
            console.log(`\n🎯 Ardian in JOIN results: ${ardianInJoin ? '✅ FOUND' : '❌ NOT FOUND'}`);
            
            if (ardianInJoin) {
                console.log('🎉 SUCCESS! Ardian\'s data is now properly linked and should appear in the survey results!');
            }
        }
        
        // 5. Test the exact SurveyResults query one more time
        console.log('\n5. Testing exact SurveyResults query...');
        const { data: surveyResultsData, error: surveyResultsError } = await supabase
            .from("survey_responses")
            .select(`
                *,
                employees!inner(
                    level,
                    department,
                    name
                )
            `)
            .order("created_at", { ascending: false });
            
        if (surveyResultsError) {
            console.error('❌ SurveyResults query failed:', surveyResultsError);
        } else {
            console.log(`✅ SurveyResults query successful! Records: ${surveyResultsData?.length || 0}`);
            
            const enrichedData = (surveyResultsData || []).map(response => ({
                ...response,
                level: response.employees?.level || 'Non Managerial',
                employee_department: response.employees?.department || response.department,
                employee_name: response.employees?.name || response.name
            }));
            
            console.log('\n📊 Final enriched data for SurveyResults:');
            enrichedData.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} (${record.id_badge_number})`);
                console.log(`      - Level: ${record.level}`);
                console.log(`      - Department: ${record.employee_department}`);
                console.log(`      - Created: ${new Date(record.created_at).toLocaleString()}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Final diagnosis complete!');
}

// Run the final diagnosis
finalDiagnosis().catch(console.error);