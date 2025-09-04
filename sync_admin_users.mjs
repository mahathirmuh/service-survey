import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAdminUsers() {
    console.log('Starting admin_users table synchronization...');
    
    try {
        // First, check if username column exists
        console.log('Checking current table structure...');
        const { data: existingUsers, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .limit(1);
            
        if (fetchError) {
            console.error('Error fetching users:', fetchError);
            return;
        }
        
        // Check if username column exists
        const hasUsernameColumn = existingUsers && existingUsers.length > 0 && 'username' in existingUsers[0];
        
        if (!hasUsernameColumn) {
            console.log('Username column not found. This requires database admin access to add.');
            console.log('Please run the following SQL commands in your Supabase SQL editor:');
            console.log(`
-- Add username column to admin_users table
ALTER TABLE public.admin_users ADD COLUMN username TEXT;

-- Update existing records to set username based on name
UPDATE public.admin_users 
SET username = LOWER(REPLACE(name, ' ', '.'));

-- Make username column NOT NULL and UNIQUE
ALTER TABLE public.admin_users ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_username_unique UNIQUE (username);

-- Update role and status constraints
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('super admin', 'admin', 'manager', 'viewer'));

ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_status_check;
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update existing data to lowercase
UPDATE public.admin_users SET role = LOWER(role);
UPDATE public.admin_users SET status = LOWER(status);`);
            return;
        }
        
        console.log('Username column exists. Checking data consistency...');
        
        // Get all users
        const { data: allUsers, error: getAllError } = await supabase
            .from('admin_users')
            .select('*');
            
        if (getAllError) {
            console.error('Error fetching all users:', getAllError);
            return;
        }
        
        console.log(`Found ${allUsers.length} users in the database`);
        
        // Check for users without username
        const usersWithoutUsername = allUsers.filter(user => !user.username);
        
        if (usersWithoutUsername.length > 0) {
            console.log(`Found ${usersWithoutUsername.length} users without username. Updating...`);
            
            for (const user of usersWithoutUsername) {
                const username = user.name.toLowerCase().replace(/\s+/g, '.');
                console.log(`Updating user ${user.name} with username: ${username}`);
                
                const { error: updateError } = await supabase
                    .from('admin_users')
                    .update({ username })
                    .eq('id', user.id);
                    
                if (updateError) {
                    console.error(`Error updating user ${user.name}:`, updateError);
                } else {
                    console.log(`Successfully updated user ${user.name}`);
                }
            }
        }
        
        // Check for inconsistent role/status casing
        const usersWithInconsistentData = allUsers.filter(user => 
            user.role !== user.role.toLowerCase() || user.status !== user.status.toLowerCase()
        );
        
        if (usersWithInconsistentData.length > 0) {
            console.log(`Found ${usersWithInconsistentData.length} users with inconsistent role/status casing. Updating...`);
            
            for (const user of usersWithInconsistentData) {
                console.log(`Updating user ${user.name} role/status casing`);
                
                const { error: updateError } = await supabase
                    .from('admin_users')
                    .update({ 
                        role: user.role.toLowerCase(),
                        status: user.status.toLowerCase()
                    })
                    .eq('id', user.id);
                    
                if (updateError) {
                    console.error(`Error updating user ${user.name}:`, updateError);
                } else {
                    console.log(`Successfully updated user ${user.name}`);
                }
            }
        }
        
        // Add test users if they don't exist
        const testUsers = [
            { name: 'Andi Admin', username: 'andi.admin', email: 'andi.admin@example.com', password: 'admin123', role: 'admin', status: 'active' },
            { name: 'Budi Manager', username: 'budi.manager', email: 'budi.manager@example.com', password: 'manager123', role: 'manager', status: 'active' },
            { name: 'Citra Viewer', username: 'citra.viewer', email: 'citra.viewer@example.com', password: 'viewer123', role: 'viewer', status: 'active' }
        ];
        
        for (const testUser of testUsers) {
            const existingUser = allUsers.find(user => user.email === testUser.email);
            if (!existingUser) {
                console.log(`Adding test user: ${testUser.name}`);
                
                const { error: insertError } = await supabase
                    .from('admin_users')
                    .insert(testUser);
                    
                if (insertError) {
                    console.error(`Error adding test user ${testUser.name}:`, insertError);
                } else {
                    console.log(`Successfully added test user ${testUser.name}`);
                }
            } else {
                console.log(`Test user ${testUser.name} already exists`);
            }
        }
        
        console.log('Admin users synchronization completed successfully!');
        
        // Display final user list
        const { data: finalUsers } = await supabase
            .from('admin_users')
            .select('username, email, role, status')
            .order('created_at');
            
        console.log('\nFinal user list:');
        console.table(finalUsers);
        
    } catch (error) {
        console.error('Error during synchronization:', error);
    }
}

// Run the synchronization
syncAdminUsers();