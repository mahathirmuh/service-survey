-- Add level column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Non-Managerial' 
CHECK (level IN ('Managerial', 'Non-Managerial'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS IX_employees_level ON public.employees(level);

-- Update existing employees to have default level
UPDATE public.employees 
SET level = 'Non-Managerial' 
WHERE level IS NULL;