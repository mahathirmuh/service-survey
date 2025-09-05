// Check table permissions and constraints
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkPermissions() {
    console.log('🔒 Checking table permissions and constraints...');
    console.log('=' .repeat(50));
    
    try {
        // 1. Try a simple select to confirm we can read
        console.log('\n1. Testing read permissions...');
        const { data: readTest, error: readError } = await supabase
            .from('survey_responses')
            .select('id, name, id_badge_number, employee_id')
            .eq('id_badge_number', 'MTI240266');
            
        if (readError) {
            console.error('❌ Read error:', readError);
        } else {
            console.log('✅ Read successful:', readTest);
        }
        
        // 2. Try updating a different field to test write permissions
        console.log('\n2. Testing write permissions with a different field...');
        const { data: writeTest, error: writeError } = await supabase
            .from('survey_responses')
            .update({ 
                // Try updating a text field that should be safe
                updated_at: new Date().toISOString()
            })
            .eq('id_badge_number', 'MTI240266')
            .select('id, name, updated_at');
            
        if (writeError) {
            console.error('❌ Write error:', writeError);
        } else {
            console.log('✅ Write test successful:', writeTest);
        }
        
        // 3. Try inserting a test record to check insert permissions
        console.log('\n3. Testing insert permissions...');
        const testRecord = {
            name: 'Permission Test',
            id_badge_number: 'PERM_TEST',
            email: 'test@test.com',
            level: 'Non Managerial',
            department: 'Test',
            employee_id: '3670c920-e378-4680-9020-d18dd0241aea',
            responses: { test: 'data' }
        };
        
        const { data: insertTest, error: insertError } = await supabase
            .from('survey_responses')
            .insert(testRecord)
            .select('*');
            
        if (insertError) {
            console.error('❌ Insert error:', insertError);
        } else {
            console.log('✅ Insert successful:', insertTest);
            
            // Clean up the test record
            await supabase
                .from('survey_responses')
                .delete()
                .eq('id_badge_number', 'PERM_TEST');
            console.log('🧹 Test record cleaned up');
        }
        
        // 4. Try using upsert instead of update
        console.log('\n4. Trying upsert approach...');
        const { data: upsertTest, error: upsertError } = await supabase
            .from('survey_responses')
            .upsert({
                id: 'c6281843-8316-4154-8eb5-6f97c79ea435',
                name: 'Ardian',
                id_badge_number: 'MTI240266',
                email: 'ardian@merdekabattery.com',
                level: 'Managerial',
                department: 'External Affair',
                employee_id: '3670c920-e378-4680-9020-d18dd0241aea',
                responses: {} // We'll need to preserve the original responses
            })
            .select('*');
            
        if (upsertError) {
            console.error('❌ Upsert error:', upsertError);
        } else {
            console.log('✅ Upsert successful:', upsertTest);
        }
        
        // 5. Final verification
        console.log('\n5. Final verification...');
        const { data: finalCheck, error: finalError } = await supabase
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
            
        if (finalError) {
            console.error('❌ Final check failed:', finalError);
        } else {
            console.log(`✅ Final check successful! Records: ${finalCheck?.length || 0}`);
            
            finalCheck?.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} (${record.id_badge_number})`);
                console.log(`      - Employee ID: ${record.employee_id}`);
                console.log(`      - Survey Level: ${record.level}`);
                console.log(`      - Employee Level: ${record.employees.level}`);
            });
            
            const ardianFound = finalCheck?.some(r => r.id_badge_number === 'MTI240266');
            console.log(`\n🎯 Ardian found in final results: ${ardianFound ? '✅ YES' : '❌ NO'}`);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Permission check complete!');
}

// Run the permission check
checkPermissions().catch(console.error);