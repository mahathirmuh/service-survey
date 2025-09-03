import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uwbqdiwuczhorzdzdlqp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
    console.log('Testing Supabase connection...');
    
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .limit(5);
        
        console.log('Query result:', { data, error });
        
        if (error) {
            console.error('Supabase error:', error);
        } else {
            console.log('Success! Found', data?.length || 0, 'users');
            console.log('Users:', data);
        }
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();