// Get original survey responses data and try targeted update
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getOriginalData() {
    console.log('📋 Getting original survey data and attempting targeted update...');
    console.log('=' .repeat(60));
    
    try {
        // 1. Get Ardian's complete original record
        console.log('\n1. Getting Ardian\'s complete original record...');
        const { data: originalRecord, error: originalError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('id_badge_number', 'MTI240266')
            .single();
            
        if (originalError) {
            console.error('❌ Error getting original record:', originalError);
            return;
        }
        
        console.log('✅ Original record found:');
        console.log('   - ID:', originalRecord.id);
        console.log('   - Name:', originalRecord.name);
        console.log('   - Badge:', originalRecord.id_badge_number);
        console.log('   - Email:', originalRecord.email);
        console.log('   - Level:', originalRecord.level);
        console.log('   - Department:', originalRecord.department);
        console.log('   - Employee ID:', originalRecord.employee_id || 'NULL');
        console.log('   - Created:', originalRecord.created_at);
        
        // Show all columns to understand the structure
        console.log('\n📊 All columns in the record:');
        Object.keys(originalRecord).forEach(key => {
            const value = originalRecord[key];
            const displayValue = typeof value === 'object' ? JSON.stringify(value).substring(0, 100) + '...' : value;
            console.log(`   - ${key}: ${displayValue}`);
        });
        
        // 2. Try updating with the complete record structure
        console.log('\n2. Attempting update with complete record structure...');
        const updatedRecord = {
            ...originalRecord,
            employee_id: '3670c920-e378-4680-9020-d18dd0241aea'
        };
        
        // Remove the id from the update payload
        delete updatedRecord.id;
        delete updatedRecord.created_at;
        delete updatedRecord.updated_at;
        
        const { data: updateResult, error: updateError } = await supabase
            .from('survey_responses')
            .update(updatedRecord)
            .eq('id', originalRecord.id)
            .select('id, name, id_badge_number, employee_id');
            
        if (updateError) {
            console.error('❌ Update with complete structure failed:', updateError);
        } else {
            console.log('✅ Update with complete structure result:', updateResult);
        }
        
        // 3. Try a minimal update with just the employee_id
        console.log('\n3. Trying minimal update with just employee_id...');
        const { data: minimalUpdate, error: minimalError } = await supabase
            .from('survey_responses')
            .update({ employee_id: '3670c920-e378-4680-9020-d18dd0241aea' })
            .eq('id', originalRecord.id);
            
        if (minimalError) {
            console.error('❌ Minimal update failed:', minimalError);
        } else {
            console.log('✅ Minimal update result:', minimalUpdate);
        }
        
        // 4. Check if the update actually worked by re-fetching
        console.log('\n4. Re-fetching to check if update worked...');
        const { data: refetchedRecord, error: refetchError } = await supabase
            .from('survey_responses')
            .select('id, name, id_badge_number, employee_id')
            .eq('id', originalRecord.id)
            .single();
            
        if (refetchError) {
            console.error('❌ Re-fetch failed:', refetchError);
        } else {
            console.log('✅ Re-fetched record:', refetchedRecord);
            
            if (refetchedRecord.employee_id) {
                console.log('🎉 SUCCESS! Employee ID has been updated!');
            } else {
                console.log('❌ Employee ID is still NULL');
            }
        }
        
        // 5. Test the JOIN query one more time
        console.log('\n5. Testing JOIN query after update attempt...');
        const { data: joinTest, error: joinError } = await supabase
            .from('survey_responses')
            .select(`
                id,
                name,
                id_badge_number,
                employee_id,
                level,
                employees!inner(
                    id,
                    level,
                    department,
                    name
                )
            `)
            .order('created_at', { ascending: false });
            
        if (joinError) {
            console.error('❌ JOIN test failed:', joinError);
        } else {
            console.log(`✅ JOIN test successful! Records: ${joinTest?.length || 0}`);
            
            joinTest?.forEach((record, index) => {
                console.log(`\n   ${index + 1}. ${record.name} (${record.id_badge_number})`);
                console.log(`      - Survey Level: ${record.level}`);
                console.log(`      - Employee Level: ${record.employees.level}`);
                console.log(`      - Employee ID: ${record.employee_id}`);
                console.log(`      - Match: ${record.level === record.employees.level ? '✅' : '❌'}`);
            });
            
            const ardianInResults = joinTest?.some(r => r.id_badge_number === 'MTI240266');
            console.log(`\n🎯 Ardian in JOIN results: ${ardianInResults ? '✅ FOUND' : '❌ NOT FOUND'}`);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Original data analysis complete!');
}

// Run the analysis
getOriginalData().catch(console.error);