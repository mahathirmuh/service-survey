-- SQL script to fix RLS policies for employees table in online Supabase database
-- Run this in your Supabase dashboard SQL editor

-- First, check if RLS is enabled on the employees table
-- If not enabled, enable it
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert employee data" ON public.employees;
DROP POLICY IF EXISTS "Anyone can update employee data" ON public.employees;
DROP POLICY IF EXISTS "Anyone can delete employee data" ON public.employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.employees;

-- Create policy to allow anyone to read employee data
CREATE POLICY "Enable read access for all users" 
ON public.employees 
FOR SELECT 
USING (true);

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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'employees';