import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials from client.ts
const SUPABASE_URL = "https://tbuuysrvoxhsgcuwmilk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidXV5c3J2b3hoc2djdXdtaWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTM4MjgsImV4cCI6MjA2Njk4OTgyOH0.bsR1gq8CWpOP_ceYgMGi_IksSltuvSkPMO0VpK_rBNM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testRLSPolicies() {
  console.log('🔧 Testing RLS Policies for employees table...');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Try to read employees
    console.log('\n1. Testing SELECT permission...');
    const { data: selectData, error: selectError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ SELECT failed:', selectError.message);
    } else {
      console.log('✅ SELECT works - found', selectData?.length || 0, 'employees');
    }

    // Test 2: Try to insert a test employee
    console.log('\n2. Testing INSERT permission...');
    const testEmployee = {
      id_badge_number: `TEST_${Date.now()}`,
      name: 'Test Employee',
      department: 'Test Department'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('employees')
      .insert([testEmployee])
      .select();
    
    if (insertError) {
      console.log('❌ INSERT failed:', insertError.message);
      console.log('   Error code:', insertError.code);
      
      if (insertError.code === '42501') {
        console.log('\n🚨 DIAGNOSIS: Row Level Security policy violation detected!');
        console.log('   This confirms the INSERT policy is missing or incorrect.');
      }
    } else {
      console.log('✅ INSERT works:', insertData);
      
      // Test 3: Try to update the test employee
      console.log('\n3. Testing UPDATE permission...');
      const { data: updateData, error: updateError } = await supabase
        .from('employees')
        .update({ name: 'Updated Test Employee' })
        .eq('id_badge_number', testEmployee.id_badge_number)
        .select();
      
      if (updateError) {
        console.log('❌ UPDATE failed:', updateError.message);
      } else {
        console.log('✅ UPDATE works:', updateData);
      }
      
      // Test 4: Try to delete the test employee
      console.log('\n4. Testing DELETE permission...');
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id_badge_number', testEmployee.id_badge_number);
      
      if (deleteError) {
        console.log('❌ DELETE failed:', deleteError.message);
      } else {
        console.log('✅ DELETE works - test data cleaned up');
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('📋 SUMMARY:');
    console.log('=' .repeat(50));
    
    if (insertError && insertError.code === '42501') {
      console.log('\n🔴 ISSUE CONFIRMED: RLS policies are blocking INSERT operations');
      console.log('\n📝 SOLUTION: You need to run this SQL in your Supabase Dashboard:');
      console.log('\n```sql');
      console.log('-- Enable RLS (if not already enabled)');
      console.log('ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Drop existing policies to avoid conflicts');
      console.log('DROP POLICY IF EXISTS "Anyone can insert employee data" ON public.employees;');
      console.log('DROP POLICY IF EXISTS "Anyone can update employee data" ON public.employees;');
      console.log('DROP POLICY IF EXISTS "Anyone can delete employee data" ON public.employees;');
      console.log('DROP POLICY IF EXISTS "Enable read access for all users" ON public.employees;');
      console.log('DROP POLICY IF EXISTS "Anyone can read employee data" ON public.employees;');
      console.log('');
      console.log('-- Create comprehensive policies');
      console.log('CREATE POLICY "Enable read access for all users"');
      console.log('ON public.employees FOR SELECT USING (true);');
      console.log('');
      console.log('CREATE POLICY "Anyone can insert employee data"');
      console.log('ON public.employees FOR INSERT WITH CHECK (true);');
      console.log('');
      console.log('CREATE POLICY "Anyone can update employee data"');
      console.log('ON public.employees FOR UPDATE USING (true) WITH CHECK (true);');
      console.log('');
      console.log('CREATE POLICY "Anyone can delete employee data"');
      console.log('ON public.employees FOR DELETE USING (true);');
      console.log('```');
      console.log('\n🌐 Steps:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project: tbuuysrvoxhsgcuwmilk');
      console.log('3. Go to SQL Editor');
      console.log('4. Paste and run the SQL above');
      console.log('5. Try your Excel import again');
    } else {
      console.log('\n🟢 All RLS policies appear to be working correctly!');
      console.log('   The Excel import issue might be caused by something else.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRLSPolicies();