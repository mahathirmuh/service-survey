-- Apply RLS policies for employees table
-- This ensures all CRUD operations are allowed

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert employee data" ON public.employees;
DROP POLICY IF EXISTS "Anyone can update employee data" ON public.employees;
DROP POLICY IF EXISTS "Anyone can delete employee data" ON public.employees;

-- Create policy to allow anyone to insert employee data
CREATE POLICY "Anyone can insert employee data" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update employee data
CREATE POLICY "Anyone can update employee data" 
ON public.employees 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create policy to allow anyone to delete employee data
CREATE POLICY "Anyone can delete employee data" 
ON public.employees 
FOR DELETE 
USING (true);