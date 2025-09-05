// Verification script to check if the Analytics mismatch has been resolved
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyAnalyticsFix() {
    console.log('🔍 Verifying Analytics Mismatch Fix');
    console.log('=' .repeat(50));
    
    try {
        // 1. Check Submission Status (all survey responses)
        console.log('\n1. 📋 Checking Submission Status...');
        const { data: allResponses, error: responseError } = await supabase
            .from('survey_responses')
            .select('id, name, id_badge_number, level, department, employee_id')
            .order('created_at', { ascending: false });
            
        if (responseError) {
            console.error('❌ Error fetching survey responses:', responseError);
            return;
        }
        
        const managerialSubmissions = allResponses?.filter(r => r.level === 'Managerial') || [];
        console.log(`✅ Total survey responses: ${allResponses?.length || 0}`);
        console.log(`✅ Managerial submissions: ${managerialSubmissions.length}`);
        
        console.log('\n📝 Managerial submissions details:');
        managerialSubmissions.forEach((submission, index) => {
            const linkStatus = submission.employee_id ? '🔗 Linked' : '❌ Unlinked';
            console.log(`   ${index + 1}. ${submission.name} (${submission.id_badge_number}) - ${linkStatus}`);
            console.log(`      Employee ID: ${submission.employee_id || 'NULL'}`);
        });
        
        // 2. Check Analytics Query (with INNER JOIN)
        console.log('\n2. 📊 Checking Survey Analytics Query...');
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
                    id,
                    level,
                    department,
                    name
                )
            `)
            .order('created_at', { ascending: false });
            
        if (analyticsError) {
            console.error('❌ Analytics query failed:', analyticsError);
        } else {
            const managerialAnalytics = analyticsData?.filter(r => r.employees.level === 'Managerial') || [];
            console.log(`✅ Analytics query successful!`);
            console.log(`✅ Total records in Analytics: ${analyticsData?.length || 0}`);
            console.log(`✅ Managerial records in Analytics: ${managerialAnalytics.length}`);
            
            console.log('\n📈 Analytics records details:');
            analyticsData?.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.name} (${record.id_badge_number})`);
                console.log(`      Survey Level: ${record.level}`);
                console.log(`      Employee Level: ${record.employees.level}`);
                console.log(`      Employee ID: ${record.employee_id}`);
                console.log(`      Department: ${record.employees.department}`);
            });
        }
        
        // 3. Compare and Report
        console.log('\n3. 🔍 Comparison & Status Report');
        console.log('-'.repeat(40));
        
        const submissionCount = managerialSubmissions.length;
        const analyticsCount = analyticsData?.filter(r => r.employees.level === 'Managerial').length || 0;
        
        console.log(`📋 Submission Status Count: ${submissionCount}`);
        console.log(`📊 Survey Analytics Count: ${analyticsCount}`);
        
        if (submissionCount === analyticsCount) {
            console.log('\n✅ SUCCESS: Mismatch has been resolved!');
            console.log('   Both Submission Status and Survey Analytics show the same count.');
        } else {
            console.log('\n❌ MISMATCH STILL EXISTS:');
            console.log(`   Difference: ${submissionCount - analyticsCount} responses`);
            
            // Identify which responses are missing from analytics
            const analyticsIds = new Set(analyticsData?.map(r => r.id_badge_number) || []);
            const missingFromAnalytics = managerialSubmissions.filter(s => !analyticsIds.has(s.id_badge_number));
            
            if (missingFromAnalytics.length > 0) {
                console.log('\n🔍 Responses missing from Analytics:');
                missingFromAnalytics.forEach((missing, index) => {
                    console.log(`   ${index + 1}. ${missing.name} (${missing.id_badge_number})`);
                    console.log(`      Employee ID: ${missing.employee_id || 'NULL - THIS IS THE PROBLEM'}`);
                });
            }
        }
        
        // 4. Specific check for Ardian
        console.log('\n4. 🎯 Specific Check for Ardian (MTI240266)');
        console.log('-'.repeat(40));
        
        const ardianSubmission = managerialSubmissions.find(s => s.id_badge_number === 'MTI240266');
        const ardianAnalytics = analyticsData?.find(r => r.id_badge_number === 'MTI240266');
        
        if (ardianSubmission) {
            console.log('✅ Ardian found in Submission Status');
            console.log(`   Employee ID: ${ardianSubmission.employee_id || 'NULL'}`);
        } else {
            console.log('❌ Ardian NOT found in Submission Status');
        }
        
        if (ardianAnalytics) {
            console.log('✅ Ardian found in Survey Analytics');
            console.log(`   Employee ID: ${ardianAnalytics.employee_id}`);
        } else {
            console.log('❌ Ardian NOT found in Survey Analytics');
            if (ardianSubmission && !ardianSubmission.employee_id) {
                console.log('   💡 Reason: Missing employee_id in survey_responses table');
                console.log('   🔧 Solution: Run the SQL script fix-ardian-employee-id.sql');
            }
        }
        
        // 5. Final recommendations
        console.log('\n5. 💡 Recommendations');
        console.log('-'.repeat(40));
        
        if (submissionCount === analyticsCount) {
            console.log('🎉 No action needed - the mismatch has been resolved!');
            console.log('🔄 You can now refresh the Survey Analytics page.');
        } else {
            console.log('🔧 Action needed:');
            console.log('   1. Run the SQL script: fix-ardian-employee-id.sql in Supabase SQL Editor');
            console.log('   2. Refresh the Survey Analytics page');
            console.log('   3. Run this verification script again to confirm the fix');
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Verification complete!');
}

// Run the verification
verifyAnalyticsFix().catch(console.error);