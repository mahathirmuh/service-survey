// Script to fix the foreign key relationship between survey_responses and employees
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixForeignKey() {
    console.log('🔧 Fixing foreign key relationships...');
    console.log('=' .repeat(50));
    
    try {
        // 1. Get all survey responses with null employee_id
        console.log('\n1. Finding survey responses with null employee_id...');
        const { data: orphanedResponses, error: orphanError } = await supabase
            .from('survey_responses')
            .select('*')
            .is('employee_id', null);
            
        if (orphanError) {
            console.error('❌ Error fetching orphaned responses:', orphanError);
            return;
        }
        
        console.log(`✅ Found ${orphanedResponses?.length || 0} survey responses with null employee_id`);
        
        // 2. Fix each orphaned response
        for (const response of orphanedResponses || []) {
            console.log(`\n🔍 Processing ${response.name} (${response.id_badge_number})...`);
            
            // Find matching employee by badge number
            const { data: matchingEmployee, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('id_badge_number', response.id_badge_number)
                .single();
                
            if (empError) {
                console.error(`❌ No matching employee found for ${response.id_badge_number}:`, empError);
                continue;
            }
            
            console.log(`✅ Found matching employee: ${matchingEmployee.name} (ID: ${matchingEmployee.id})`);
            
            // Update the survey response with the correct employee_id
            const { data: updatedResponse, error: updateError } = await supabase
                .from('survey_responses')
                .update({ employee_id: matchingEmployee.id })
                .eq('id', response.id)
                .select()
                .single();
                
            if (updateError) {
                console.error(`❌ Error updating survey response for ${response.name}:`, updateError);
            } else {
                console.log(`✅ Successfully linked ${response.name} to employee ID: ${updatedResponse.employee_id}`);
            }
        }
        
        // 3. Verify the fix by testing the INNER JOIN
        console.log('\n3. Verifying the fix with INNER JOIN...');
        const { data: joinTest, error: joinError } = await supabase
            .from('survey_responses')
            .select(`
                *,
                employees!inner(
                    level,
                    department,
                    name
                )
            `)
            .order('created_at', { ascending: false });
            
        if (joinError) {
            console.error('❌ INNER JOIN still failing:', joinError);
        } else {
            console.log(`✅ INNER JOIN successful! Found ${joinTest?.length || 0} records`);
            
            // Check if Ardian is now included
            const ardianRecord = joinTest?.find(record => record.id_badge_number === 'MTI240266');
            if (ardianRecord) {
                console.log('🎉 Ardian is now included in the results!');
                console.log('   - Survey Name:', ardianRecord.name);
                console.log('   - Survey Level:', ardianRecord.level);
                console.log('   - Employee Name:', ardianRecord.employees.name);
                console.log('   - Employee Level:', ardianRecord.employees.level);
                console.log('   - Levels match:', ardianRecord.level === ardianRecord.employees.level ? '✅ YES' : '❌ NO');
            } else {
                console.log('❌ Ardian still not found in results');
            }
            
            // Show all records for verification
            console.log('\n📊 All survey records with employee data:');
            joinTest?.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} (${record.id_badge_number}) - Survey: ${record.level}, Employee: ${record.employees.level}`);
            });
        }
        
        // 4. Test the exact query used by SurveyResults component
        console.log('\n4. Testing SurveyResults component query...');
        const { data: surveyData, error: surveyError } = await supabase
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
            
        if (surveyError) {
            console.error('❌ SurveyResults query failed:', surveyError);
        } else {
            console.log(`✅ SurveyResults query successful! Records: ${surveyData?.length || 0}`);
            
            // Transform data like the component does
            const enrichedData = (surveyData || []).map(response => ({
                ...response,
                level: response.employees?.level || 'Non Managerial',
                employee_department: response.employees?.department || response.department,
                employee_name: response.employees?.name || response.name
            }));
            
            console.log('📋 Enriched data sample:');
            enrichedData.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} - Level: ${record.level} - Dept: ${record.employee_department}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Foreign key fix complete!');
}

// Run the fix
fixForeignKey().catch(console.error);