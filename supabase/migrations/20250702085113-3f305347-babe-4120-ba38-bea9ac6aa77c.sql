-- Create employees table for ID Badge Number validation
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_badge_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employee access
CREATE POLICY "Anyone can read employee data" 
ON public.employees 
FOR SELECT 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample employees for testing
INSERT INTO public.employees (id_badge_number, name, department) VALUES 
('MTI001', 'John Doe', 'Environmental Department'),
('MTI002', 'Jane Smith', 'Finance Department'),
('MTI003', 'Mike Johnson', 'Human Resources'),
('MTI004', 'Sarah Wilson', 'External Affair Department'),
('MTI005', 'David Brown', 'Environmental Department');