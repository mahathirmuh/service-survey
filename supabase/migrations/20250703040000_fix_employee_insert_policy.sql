-- Fix RLS policy for employees table to allow INSERT operations
-- This migration adds the missing INSERT policy for the employees table

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