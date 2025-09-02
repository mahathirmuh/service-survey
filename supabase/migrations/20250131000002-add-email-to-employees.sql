-- Add email column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_employees_email ON public.employees(email);

-- Add comment for documentation
COMMENT ON COLUMN public.employees.email IS 'Employee email address for contact purposes';