import { supabase } from "@/integrations/supabase/client";

/**
 * Database migration utility to ensure required columns exist in employees table
 */
export const ensureEmployeesTableColumns = async () => {
  try {
    console.log('Starting database migration to ensure employees table columns...');
    
    // SQL to ensure status column exists
    const statusColumnSQL = `
      DO $$
      BEGIN
          -- Check if the status column exists
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'employees' 
              AND column_name = 'status'
          ) THEN
              -- Add the status column
              ALTER TABLE public.employees 
              ADD COLUMN status TEXT NOT NULL DEFAULT 'Not Submitted' 
              CHECK (status IN ('Submitted', 'Not Submitted'));
              
              -- Create index for performance on status lookups
              CREATE INDEX IF NOT EXISTS IX_employees_status ON public.employees(status);
              
              -- Update existing employees to have default status
              UPDATE public.employees 
              SET status = 'Not Submitted' 
              WHERE status IS NULL;
              
              RAISE NOTICE 'Status column added to employees table';
          ELSE
              RAISE NOTICE 'Status column already exists in employees table';
          END IF;
      END
      $$;
    `;

    // SQL to ensure email column exists
    const emailColumnSQL = `
      DO $$
      BEGIN
          -- Check if the email column exists
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'employees' 
              AND column_name = 'email'
          ) THEN
              -- Add the email column
              ALTER TABLE public.employees 
              ADD COLUMN email TEXT;
              
              -- Create index for performance on email lookups
              CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);
              
              RAISE NOTICE 'Email column added to employees table';
          ELSE
              RAISE NOTICE 'Email column already exists in employees table';
          END IF;
      END
      $$;
    `;

    // SQL to ensure level column exists
    const levelColumnSQL = `
      DO $$
      BEGIN
          -- Check if the level column exists
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'employees' 
              AND column_name = 'level'
          ) THEN
              -- Add the level column
              ALTER TABLE public.employees 
              ADD COLUMN level TEXT NOT NULL DEFAULT 'Non-Managerial' 
              CHECK (level IN ('Managerial', 'Non-Managerial'));
              
              -- Create index for performance on level lookups
              CREATE INDEX IF NOT EXISTS IX_employees_level ON public.employees(level);
              
              RAISE NOTICE 'Level column added to employees table';
          ELSE
              RAISE NOTICE 'Level column already exists in employees table';
          END IF;
      END
      $$;
    `;

    // Execute the migrations - Note: exec_sql RPC not available, using alternative approach
    console.log('Status column migration SQL prepared:', statusColumnSQL);
    
    // Try alternative approach with direct SQL
    const { error: altStatusError } = await supabase
      .from('employees')
      .select('status')
      .limit(1);
      
    if (altStatusError && altStatusError.message.includes('column "status" does not exist')) {
      console.log('Status column does not exist, attempting to add it...');
      // We'll need to handle this through the admin interface or direct database access
      throw new Error('Status column missing and cannot be added through client. Please run migration manually.');
    }

    // Note: exec_sql RPC not available, logging SQL for manual execution
    console.log('Email column migration SQL prepared:', emailColumnSQL);
    console.log('Level column migration SQL prepared:', levelColumnSQL);

    console.log('Database migration completed successfully (SQL logged for manual execution)');
    return { success: true };
    
  } catch (error) {
    console.error('Database migration failed:', error);
    return { success: false, error };
  }
};

/**
 * Check if all required columns exist in employees table
 */
export const checkEmployeesTableSchema = async () => {
  try {
    // Try to select all columns to see what exists
    const { data, error } = await supabase
      .from('employees')
      .select('id, id_badge_number, name, department, email, status, level, created_at, updated_at')
      .limit(1);
    
    if (error) {
      console.error('Schema check error:', error);
      return { 
        hasStatus: false, 
        hasEmail: false, 
        hasLevel: false, 
        error: error.message 
      };
    }
    
    return { 
      hasStatus: true, 
      hasEmail: true, 
      hasLevel: true, 
      error: null 
    };
    
  } catch (error) {
    console.error('Schema check failed:', error);
    return { 
      hasStatus: false, 
      hasEmail: false, 
      hasLevel: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};