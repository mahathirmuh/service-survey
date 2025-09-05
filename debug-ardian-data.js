// Debug script to investigate Ardian's survey submission issue
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugArdianData() {
    console.log('🔍 Investigating Ardian\'s survey submission issue...');
    console.log('=' .repeat(60));
    
    try {
        // 1. Check if Ardian exists in employees table
        console.log('\n1. Checking employees table for Ardian...');
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('*')
            .ilike('name', '%ardian%');
            
        if (empError) {
            console.error('❌ Error querying employees:', empError);
        } else {
            console.log(`✅ Found ${employees?.length || 0} employee(s) matching "Ardian":`);
            employees?.forEach(emp => {
                console.log(`   - ID: ${emp.id_badge_number}, Name: ${emp.name}, Dept: ${emp.department}, Status: ${emp.status}`);
            });
        }
        
        // 2. Check survey_responses for Ardian
        console.log('\n2. Checking survey_responses table for Ardian...');
        const { data: responses, error: respError } = await supabase
            .from('survey_responses')
            .select('*')
            .ilike('name', '%ardian%');
            
        if (respError) {
            console.error('❌ Error querying survey_responses:', respError);
        } else {
            console.log(`✅ Found ${responses?.length || 0} survey response(s) for "Ardian":`);
            responses?.forEach(resp => {
                console.log(`   - ID: ${resp.id_badge_number}, Name: ${resp.name}, Dept: ${resp.department}, Created: ${resp.created_at}`);
            });
        }
        
        // 3. Check for MTI240266 specifically (Ardian's badge number from the screenshot)
        console.log('\n3. Checking for badge number MTI240266...');
        const { data: badgeEmployee, error: badgeEmpError } = await supabase
            .from('employees')
            .select('*')
            .eq('id_badge_number', 'MTI240266');
            
        if (badgeEmpError) {
            console.error('❌ Error querying employee by badge:', badgeEmpError);
        } else {
            console.log(`✅ Employee with badge MTI240266:`);
            console.log(badgeEmployee?.[0] || 'Not found');
        }
        
        const { data: badgeResponse, error: badgeRespError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('id_badge_number', 'MTI240266');
            
        if (badgeRespError) {
            console.error('❌ Error querying survey response by badge:', badgeRespError);
        } else {
            console.log(`✅ Survey response for badge MTI240266:`);
            console.log(badgeResponse?.[0] || 'Not found');
        }
        
        // 4. Check total counts
        console.log('\n4. Database summary...');
        const { count: empCount } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true });
            
        const { count: respCount } = await supabase
            .from('survey_responses')
            .select('*', { count: 'exact', head: true });
            
        console.log(`📊 Total employees: ${empCount}`);
        console.log(`📊 Total survey responses: ${respCount}`);
        
        // 5. Check for any recent submissions
        console.log('\n5. Recent survey submissions (last 10)...');
        const { data: recentResponses, error: recentError } = await supabase
            .from('survey_responses')
            .select('id_badge_number, name, department, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (recentError) {
            console.error('❌ Error querying recent responses:', recentError);
        } else {
            console.log('Recent submissions:');
            recentResponses?.forEach((resp, index) => {
                console.log(`   ${index + 1}. ${resp.name} (${resp.id_badge_number}) - ${resp.department} - ${new Date(resp.created_at).toLocaleString()}`);
            });
        }
        
        // 6. Check database schema for email column
        console.log('\n6. Checking survey_responses table schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_table_columns', { table_name: 'survey_responses' })
            .single();
            
        if (schemaError) {
            console.log('⚠️  Could not check schema via RPC, trying alternative method...');
            // Try to insert a test record to see what columns are available
            const testData = { 
                name: 'TEST', 
                id_badge_number: 'TEST123', 
                department: 'TEST',
                email: 'test@test.com'
            };
            
            const { error: testError } = await supabase
                .from('survey_responses')
                .insert(testData)
                .select()
                .single();
                
            if (testError) {
                console.log('📋 Schema test result:', testError.message);
                if (testError.message.includes('email')) {
                    console.log('✅ Email column exists but may have constraints');
                } else if (testError.code === 'PGRS7204') {
                    console.log('❌ Email column does not exist in survey_responses table');
                }
            } else {
                console.log('⚠️  Test insert succeeded - cleaning up...');
                await supabase.from('survey_responses').delete().eq('id_badge_number', 'TEST123');
            }
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Investigation complete!');
}

// Run the debug function
debugArdianData().catch(console.error);