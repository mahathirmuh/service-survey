-- Add status column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Not Submitted' 
CHECK (status IN ('Submitted', 'Not Submitted'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_employees_status ON public.employees(status);

-- Update existing employees to have default status
UPDATE public.employees 
SET status = 'Not Submitted' 
WHERE status IS NULL;