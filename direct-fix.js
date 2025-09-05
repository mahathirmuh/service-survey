// Direct fix for Ardian's employee_id without using .single()
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function directFix() {
    console.log('🔧 Direct fix for Ardian\'s employee_id...');
    console.log('=' .repeat(40));
    
    try {
        // 1. Get Ardian's employee ID
        console.log('\n1. Getting Ardian\'s employee ID...');
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('id, name, id_badge_number')
            .eq('id_badge_number', 'MTI240266');
            
        if (empError || !employees || employees.length === 0) {
            console.error('❌ Error or no employee found:', empError);
            return;
        }
        
        const employeeId = employees[0].id;
        console.log('✅ Found employee ID:', employeeId);
        
        // 2. Update survey response directly
        console.log('\n2. Updating survey response...');
        const { data: updateResult, error: updateError } = await supabase
            .from('survey_responses')
            .update({ employee_id: employeeId })
            .eq('id_badge_number', 'MTI240266')
            .select('id, name, id_badge_number, employee_id');
            
        if (updateError) {
            console.error('❌ Update error:', updateError);
            return;
        }
        
        console.log('✅ Update successful!');
        console.log('Updated records:', updateResult?.length || 0);
        updateResult?.forEach(record => {
            console.log(`   - ${record.name} (${record.id_badge_number}) -> employee_id: ${record.employee_id}`);
        });
        
        // 3. Clean up TEST record
        console.log('\n3. Cleaning up TEST record...');
        const { error: deleteError } = await supabase
            .from('survey_responses')
            .delete()
            .eq('id_badge_number', 'TEST123');
            
        if (deleteError) {
            console.log('⚠️  Could not delete TEST record:', deleteError);
        } else {
            console.log('✅ TEST record cleaned up');
        }
        
        // 4. Verify the fix
        console.log('\n4. Verifying the fix...');
        const { data: verifyData, error: verifyError } = await supabase
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
            
        if (verifyError) {
            console.error('❌ Verification failed:', verifyError);
        } else {
            console.log(`✅ Verification successful! Records: ${verifyData?.length || 0}`);
            
            verifyData?.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} (${record.id_badge_number})`);
                console.log(`      Survey Level: ${record.level}`);
                console.log(`      Employee Level: ${record.employees.level}`);
                console.log(`      Match: ${record.level === record.employees.level ? '✅' : '❌'}`);
                console.log('');
            });
            
            // Check if Ardian is now included
            const ardianFound = verifyData?.some(record => record.id_badge_number === 'MTI240266');
            console.log(`🎯 Ardian found in results: ${ardianFound ? '✅ YES' : '❌ NO'}`);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(40));
    console.log('🏁 Direct fix complete!');
}

// Run the direct fix
directFix().catch(console.error);