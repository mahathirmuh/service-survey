// Script to investigate the JOIN issue between employees and survey_responses tables
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function investigateJoinIssue() {
    console.log('🔍 Investigating JOIN issue between tables...');
    console.log('=' .repeat(60));
    
    try {
        // 1. Check both tables separately
        console.log('\n1. Checking employees table...');
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('*')
            .eq('id_badge_number', 'MTI240266');
            
        if (empError) {
            console.error('❌ Error fetching employees:', empError);
        } else {
            console.log('✅ Employees found:', employees?.length || 0);
            employees?.forEach(emp => {
                console.log('   - ID:', emp.id);
                console.log('   - Badge:', emp.id_badge_number);
                console.log('   - Name:', emp.name);
                console.log('   - Level:', emp.level);
                console.log('   - Department:', emp.department);
            });
        }
        
        console.log('\n2. Checking survey_responses table...');
        const { data: responses, error: respError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('id_badge_number', 'MTI240266');
            
        if (respError) {
            console.error('❌ Error fetching survey responses:', respError);
        } else {
            console.log('✅ Survey responses found:', responses?.length || 0);
            responses?.forEach(resp => {
                console.log('   - ID:', resp.id);
                console.log('   - Badge:', resp.id_badge_number);
                console.log('   - Name:', resp.name);
                console.log('   - Level:', resp.level);
                console.log('   - Department:', resp.department);
                console.log('   - Employee ID:', resp.employee_id);
            });
        }
        
        // 3. Try different JOIN approaches
        console.log('\n3. Testing different JOIN approaches...');
        
        // Approach 1: LEFT JOIN
        console.log('\n3a. Testing LEFT JOIN...');
        const { data: leftJoin, error: leftJoinError } = await supabase
            .from('survey_responses')
            .select(`
                *,
                employees(
                    level,
                    department,
                    name
                )
            `)
            .eq('id_badge_number', 'MTI240266');
            
        if (leftJoinError) {
            console.error('❌ LEFT JOIN error:', leftJoinError);
        } else {
            console.log('✅ LEFT JOIN successful, records:', leftJoin?.length || 0);
            leftJoin?.forEach(record => {
                console.log('   - Survey Name:', record.name);
                console.log('   - Survey Level:', record.level);
                console.log('   - Employee Data:', record.employees);
            });
        }
        
        // Approach 2: Check foreign key relationship
        console.log('\n3b. Checking foreign key relationship...');
        if (responses && responses.length > 0 && employees && employees.length > 0) {
            const response = responses[0];
            const employee = employees[0];
            
            console.log('Survey response employee_id:', response.employee_id);
            console.log('Employee table id:', employee.id);
            console.log('IDs match:', response.employee_id === employee.id ? '✅ YES' : '❌ NO');
            
            // If they don't match, let's fix it
            if (response.employee_id !== employee.id) {
                console.log('\n🔧 Fixing employee_id in survey_responses...');
                const { data: updatedResponse, error: updateError } = await supabase
                    .from('survey_responses')
                    .update({ employee_id: employee.id })
                    .eq('id_badge_number', 'MTI240266')
                    .select()
                    .single();
                    
                if (updateError) {
                    console.error('❌ Error updating employee_id:', updateError);
                } else {
                    console.log('✅ Successfully updated employee_id to:', updatedResponse.employee_id);
                }
            }
        }
        
        // 4. Test the JOIN again after potential fix
        console.log('\n4. Testing INNER JOIN after potential fix...');
        const { data: innerJoin, error: innerJoinError } = await supabase
            .from('survey_responses')
            .select(`
                *,
                employees!inner(
                    level,
                    department,
                    name
                )
            `)
            .eq('id_badge_number', 'MTI240266');
            
        if (innerJoinError) {
            console.error('❌ INNER JOIN error:', innerJoinError);
        } else {
            console.log('✅ INNER JOIN successful, records:', innerJoin?.length || 0);
            innerJoin?.forEach(record => {
                console.log('   - Survey Name:', record.name);
                console.log('   - Survey Level:', record.level);
                console.log('   - Employee Level:', record.employees.level);
                console.log('   - Levels match:', record.level === record.employees.level ? '✅ YES' : '❌ NO');
            });
        }
        
        // 5. Test the full SurveyResults query
        console.log('\n5. Testing full SurveyResults query...');
        const { data: fullQuery, error: fullQueryError } = await supabase
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
            
        if (fullQueryError) {
            console.error('❌ Full query error:', fullQueryError);
        } else {
            console.log('✅ Full query successful, total records:', fullQuery?.length || 0);
            
            // Find Ardian in the results
            const ardianRecord = fullQuery?.find(record => record.id_badge_number === 'MTI240266');
            if (ardianRecord) {
                console.log('✅ Ardian found in full query results!');
                console.log('   - Name:', ardianRecord.name);
                console.log('   - Level:', ardianRecord.level);
                console.log('   - Employee Level:', ardianRecord.employees.level);
            } else {
                console.log('❌ Ardian NOT found in full query results');
            }
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Investigation complete!');
}

// Run the investigation
investigateJoinIssue().catch(console.error);