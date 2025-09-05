// Fix the mismatch between Submission Status and Survey Analytics
// by adding the missing employee_id to Ardian's survey response
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixAnalyticsMismatch() {
    console.log('🔧 Fixing Analytics Mismatch: Adding missing employee_id...');
    console.log('=' .repeat(60));
    
    try {
        // 1. Find Ardian's employee record
        console.log('\n1. Finding Ardian\'s employee record...');
        const { data: ardianEmployee, error: empError } = await supabase
            .from('employees')
            .select('id, name, id_badge_number, level, department')
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (empError || !ardianEmployee) {
            console.error('❌ Could not find Ardian\'s employee record:', empError);
            return;
        }
        
        console.log(`✅ Found Ardian's employee record:`);
        console.log(`   - ID: ${ardianEmployee.id}`);
        console.log(`   - Name: ${ardianEmployee.name}`);
        console.log(`   - Badge: ${ardianEmployee.id_badge_number}`);
        console.log(`   - Level: ${ardianEmployee.level}`);
        console.log(`   - Department: ${ardianEmployee.department}`);
        
        // 2. Find Ardian's survey response without employee_id
        console.log('\n2. Finding Ardian\'s survey response...');
        const { data: ardianResponse, error: responseError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (responseError || !ardianResponse) {
            console.error('❌ Could not find Ardian\'s survey response:', responseError);
            return;
        }
        
        console.log(`✅ Found Ardian's survey response:`);
        console.log(`   - Response ID: ${ardianResponse.id}`);
        console.log(`   - Name: ${ardianResponse.name}`);
        console.log(`   - Current employee_id: ${ardianResponse.employee_id || 'NULL'}`);
        console.log(`   - Level: ${ardianResponse.level}`);
        console.log(`   - Department: ${ardianResponse.department}`);
        
        // 3. Add the missing employee_id using a direct SQL approach
        console.log('\n3. Adding missing employee_id using SQL...');
        
        // Use the SQL editor approach to bypass RLS
        const { data: updateResult, error: updateError } = await supabase.rpc('update_survey_response_employee_id', {
            response_id: ardianResponse.id,
            new_employee_id: ardianEmployee.id
        });
        
        if (updateError) {
            console.log('❌ RPC function not available, trying direct update...');
            
            // Try direct update (may fail due to RLS)
            const { data: directUpdate, error: directError } = await supabase
                .from('survey_responses')
                .update({ employee_id: ardianEmployee.id })
                .eq('id', ardianResponse.id)
                .select('*');
                
            if (directError) {
                console.error('❌ Direct update failed:', directError.message);
                console.log('\n🔧 Manual SQL needed. Please run this in Supabase SQL Editor:');
                console.log(`\nUPDATE public.survey_responses `);
                console.log(`SET employee_id = '${ardianEmployee.id}' `);
                console.log(`WHERE id = '${ardianResponse.id}';`);
                console.log('\nThen refresh the Survey Analytics page.');
                return;
            } else {
                console.log('✅ Successfully updated employee_id via direct update!');
            }
        } else {
            console.log('✅ Successfully updated employee_id via RPC!');
        }
        
        // 4. Verify the fix
        console.log('\n4. Verifying the fix...');
        const { data: verifyResponse, error: verifyError } = await supabase
            .from('survey_responses')
            .select('id, name, id_badge_number, employee_id, level, department')
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (verifyError) {
            console.error('❌ Verification failed:', verifyError);
        } else {
            console.log('✅ Verification successful:');
            console.log(`   - Response ID: ${verifyResponse.id}`);
            console.log(`   - Name: ${verifyResponse.name}`);
            console.log(`   - Employee ID: ${verifyResponse.employee_id}`);
            console.log(`   - Level: ${verifyResponse.level}`);
        }
        
        // 5. Test the Analytics query
        console.log('\n5. Testing Analytics query...');
        const { data: analyticsData, error: analyticsError } = await supabase
            .from('survey_responses')
            .select(`
                id,
                name,
                id_badge_number,
                level,
                department,
                employee_id,
                employees!inner(
                    level,
                    department,
                    name
                )
            `)
            .order('created_at', { ascending: false });
            
        if (analyticsError) {
            console.error('❌ Analytics query failed:', analyticsError);
        } else {
            console.log(`✅ Analytics query successful! Total records: ${analyticsData?.length || 0}`);
            
            // Count by level
            const managerialCount = analyticsData?.filter(r => r.employees.level === 'Managerial').length || 0;
            const nonManagerialCount = analyticsData?.filter(r => r.employees.level === 'Non Managerial').length || 0;
            
            console.log(`\n📈 Analytics Results:`);
            console.log(`   - Managerial responses: ${managerialCount}`);
            console.log(`   - Non Managerial responses: ${nonManagerialCount}`);
            console.log(`   - Total responses: ${analyticsData?.length || 0}`);
            
            console.log('\n👥 Individual responses:');
            analyticsData?.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} (${record.id_badge_number})`);
                console.log(`      - Level: ${record.employees.level}`);
                console.log(`      - Department: ${record.employees.department}`);
                console.log(`      - Employee ID: ${record.employee_id}`);
            });
        }
        
        // 6. Final status check
        console.log('\n6. Final status check...');
        const { data: allResponses } = await supabase
            .from('survey_responses')
            .select('id, name, id_badge_number, level, employee_id')
            .order('created_at', { ascending: false });
            
        const { data: allEmployees } = await supabase
            .from('employees')
            .select('id, name, id_badge_number, level')
            .eq('level', 'Managerial');
            
        const submittedManagerial = allResponses?.filter(r => r.level === 'Managerial') || [];
        const totalManagerial = allEmployees?.length || 0;
        
        console.log(`\n📊 Final Summary:`);
        console.log(`   - Total Managerial employees: ${totalManagerial}`);
        console.log(`   - Submitted Managerial responses: ${submittedManagerial.length}`);
        console.log(`   - Analytics should show: ${submittedManagerial.filter(r => r.employee_id).length} responses`);
        
        console.log('\n✅ Submitted Managerial employees:');
        submittedManagerial.forEach((emp, index) => {
            const status = emp.employee_id ? '✅ Linked' : '❌ Missing employee_id';
            console.log(`   ${index + 1}. ${emp.name} (${emp.id_badge_number}) - ${status}`);
        });
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Analytics mismatch fix complete!');
    console.log('\n🔄 Please refresh the Survey Analytics page to see the updated results.');
}

// Run the fix
fixAnalyticsMismatch().catch(console.error);