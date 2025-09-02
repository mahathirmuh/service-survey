import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addEmailColumnToEmployees() {
  console.log('Adding email column to employees table...');
  
  try {
    // First, try to add the email column
    const { data: alterResult, error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.employees 
        ADD COLUMN IF NOT EXISTS email TEXT;
      `
    });
    
    if (alterError) {
      console.error('Error adding email column:', alterError.message);
      
      // Check if column already exists
      const { data: columnCheck, error: checkError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'employees')
        .eq('column_name', 'email');
        
      if (!checkError && columnCheck && columnCheck.length > 0) {
        console.log('✅ Email column already exists in employees table');
        return;
      }
      
      console.log('\n⚠️  Unable to add email column automatically.');
      console.log('This might be due to insufficient permissions.');
      console.log('\nPlease ask your database administrator to run this SQL command:');
      console.log('\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;');
      console.log('CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);');
      console.log('COMMENT ON COLUMN public.employees.email IS \'Employee email address for contact purposes\';');
      return;
    }
    
    console.log('✅ Email column added successfully');
    
    // Add index for performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);
      `
    });
    
    if (indexError) {
      console.log('⚠️  Index creation failed, but column was added successfully');
    } else {
      console.log('✅ Email column index created successfully');
    }
    
    // Add comment
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.employees.email IS 'Employee email address for contact purposes';
      `
    });
    
    if (commentError) {
      console.log('⚠️  Comment addition failed, but column was added successfully');
    } else {
      console.log('✅ Email column comment added successfully');
    }
    
    console.log('\n🎉 Email column migration completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.log('\n⚠️  Unable to add email column automatically.');
    console.log('Please ask your database administrator to run this SQL command:');
    console.log('\nALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;');
    console.log('CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);');
    console.log('COMMENT ON COLUMN public.employees.email IS \'Employee email address for contact purposes\';');
  }
}

// Run the migration
addEmailColumnToEmployees();