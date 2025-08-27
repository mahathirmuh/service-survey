// Script to directly run SQL commands on Supabase using REST API
import { createClient } from '@supabase/supabase-js';

// New Supabase project credentials
const SUPABASE_URL = 'https://uwbqdiwuczhorzdzdlqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnFkaXd1Y3pob3J6ZHpkbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjY5NTIsImV4cCI6MjA3MTQwMjk1Mn0.C4rP-ztsCt4S8aUkF3HqVzu5WOrYCHRtf_H25-2Ul24';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addMissingColumns() {
  try {
    console.log('🔍 Adding missing environmental_audit columns...');
    
    // First, check if the columns already exist
    const { data: checkData, error: checkError } = await supabase
      .from('survey_responses')
      .select('environmental_audit_feedback')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Columns already exist!');
      return;
    }
    
    console.log('⚠️ Columns do not exist, adding them...');
    
    // Add columns one by one using direct REST API calls
    const addColumn1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/alter_table_add_column`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        table_name: 'survey_responses',
        column_name: 'environmental_audit_question1',
        column_type: 'integer',
        default_value: '0'
      })
    });
    
    const addColumn2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/alter_table_add_column`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        table_name: 'survey_responses',
        column_name: 'environmental_audit_question2',
        column_type: 'integer',
        default_value: '0'
      })
    });
    
    const addColumn3 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/alter_table_add_column`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        table_name: 'survey_responses',
        column_name: 'environmental_audit_feedback',
        column_type: 'text',
        default_value: null
      })
    });
    
    // Check results
    const results = await Promise.all([
      addColumn1.json().catch(() => ({ error: 'Failed to parse response' })),
      addColumn2.json().catch(() => ({ error: 'Failed to parse response' })),
      addColumn3.json().catch(() => ({ error: 'Failed to parse response' }))
    ]);
    
    console.log('Results:', results);
    
    // Verify columns were added
    const { data: verifyData, error: verifyError } = await supabase
      .from('survey_responses')
      .select('environmental_audit_feedback')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Columns were not added successfully:', verifyError);
      console.log('⚠️ Please run the SQL manually in the Supabase SQL Editor');
    } else {
      console.log('✅ Columns were added successfully!');
      console.log('📥 Now run the import script: node import-to-new-project.js');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('⚠️ Please run the SQL manually in the Supabase SQL Editor');
  }
}

addMissingColumns();