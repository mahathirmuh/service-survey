-- Create admin_users table for user management
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Super Admin', 'Admin', 'Manager', 'Viewer')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin user access
CREATE POLICY "Admin users can read all admin users" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admin users can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin users can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin users can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample admin users for testing
INSERT INTO public.admin_users (name, email, password, role, status) VALUES 
('John Doe', 'john.doe@company.com', 'password123', 'Super Admin', 'Active'),
('Jane Smith', 'jane.smith@company.com', 'password123', 'Admin', 'Active'),
('Mike Johnson', 'mike.johnson@company.com', 'password123', 'Manager', 'Inactive'),
('Sarah Wilson', 'sarah.wilson@company.com', 'password123', 'Viewer', 'Active');