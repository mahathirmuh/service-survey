-- Add username column to admin_users table
ALTER TABLE public.admin_users ADD COLUMN username TEXT;

-- Update existing records to set username based on name (convert to lowercase and replace spaces with dots)
UPDATE public.admin_users 
SET username = LOWER(REPLACE(name, ' ', '.'));

-- Make username column NOT NULL and UNIQUE after populating it
ALTER TABLE public.admin_users ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_username_unique UNIQUE (username);

-- Update the role and status check constraints to match the application expectations
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('super admin', 'admin', 'manager', 'viewer'));

ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_status_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update existing data to match the new constraints (convert to lowercase)
UPDATE public.admin_users SET role = LOWER(role);
UPDATE public.admin_users SET status = LOWER(status);

-- Insert additional test users with proper username field
INSERT INTO public.admin_users (name, username, email, password, role, status) VALUES 
('Andi Admin', 'andi.admin', 'andi.admin@example.com', 'admin123', 'admin', 'active'),
('Budi Manager', 'budi.manager', 'budi.manager@example.com', 'manager123', 'manager', 'active'),
('Citra Viewer', 'citra.viewer', 'citra.viewer@example.com', 'viewer123', 'viewer', 'active')
ON CONFLICT (email) DO NOTHING;