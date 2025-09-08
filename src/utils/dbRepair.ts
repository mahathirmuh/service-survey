import { supabase } from "@/integrations/supabase/client";

/**
 * Attempt to repair the database schema by adding missing columns
 * This uses a workaround approach since we can't run DDL directly from the client
 */
export const repairEmployeesTable = async () => {
  try {
    console.log('Attempting to repair employees table schema...');
    
    // First, let's check what columns currently exist by trying to select them
    const { data: testData, error: testError } = await supabase
      .from('employees')
      .select('id, id_badge_number, name, department, created_at, updated_at')
      .limit(1);
    
    if (testError) {
      console.error('Error accessing employees table:', testError);
      return { success: false, error: testError.message };
    }
    
    // Test if status column exists
    let hasStatus = true;
    try {
      const { error: statusError } = await supabase
        .from('employees')
        .select('status')
        .limit(1);
      
      if (statusError && statusError.message.includes('column "status" does not exist')) {
        hasStatus = false;
      }
    } catch (e) {
      hasStatus = false;
    }
    
    // Test if email column exists
    let hasEmail = true;
    try {
      const { error: emailError } = await supabase
        .from('employees')
        .select('email')
        .limit(1);
      
      if (emailError && emailError.message.includes('column "email" does not exist')) {
        hasEmail = false;
      }
    } catch (e) {
      hasEmail = false;
    }
    
    // Test if level column exists
    let hasLevel = true;
    try {
      const { error: levelError } = await supabase
        .from('employees')
        .select('level')
        .limit(1);
      
      if (levelError && levelError.message.includes('column "level" does not exist')) {
        hasLevel = false;
      }
    } catch (e) {
      hasLevel = false;
    }
    
    console.log('Schema check results:', { hasStatus, hasEmail, hasLevel });
    
    // If columns are missing, we need to guide the user to fix this
    if (!hasStatus || !hasEmail || !hasLevel) {
      const missingColumns = [];
      if (!hasStatus) missingColumns.push('status');
      if (!hasEmail) missingColumns.push('email');
      if (!hasLevel) missingColumns.push('level');
      
      return {
        success: false,
        error: `Missing columns: ${missingColumns.join(', ')}. Please run the database migration manually.`,
        missingColumns,
        repairInstructions: {
          message: 'To fix this issue, please run the following SQL commands in your Supabase SQL Editor:',
          sql: generateRepairSQL(missingColumns)
        }
      };
    }
    
    return { success: true, message: 'All required columns exist' };
    
  } catch (error) {
    console.error('Database repair failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Generate SQL commands to repair missing columns
 */
const generateRepairSQL = (missingColumns: string[]) => {
  const sqlCommands = [];
  
  if (missingColumns.includes('status')) {
    sqlCommands.push(`
-- Add status column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Not Submitted' 
CHECK (status IN ('Submitted', 'Not Submitted'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_employees_status ON public.employees(status);

-- Update existing employees
UPDATE public.employees 
SET status = 'Not Submitted' 
WHERE status IS NULL;`);
  }
  
  if (missingColumns.includes('email')) {
    sqlCommands.push(`
-- Add email column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);`);
  }
  
  if (missingColumns.includes('level')) {
    sqlCommands.push(`
-- Add level column
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Non-Managerial' 
CHECK (level IN ('Managerial', 'Non-Managerial'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_employees_level ON public.employees(level);`);
  }
  
  return sqlCommands.join('\n\n');
};

/**
 * Get repair instructions for missing columns
 */
export const getRepairInstructions = async () => {
  const result = await repairEmployeesTable();
  return result;
};