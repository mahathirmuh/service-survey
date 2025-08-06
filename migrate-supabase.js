#!/usr/bin/env node

/**
 * Supabase Migration Script
 * 
 * This script helps you migrate to a new Supabase project by:
 * 1. Updating configuration files
 * 2. Testing the new connection
 * 3. Providing migration status
 * 
 * Usage: node migrate-supabase.js
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

class SupabaseMigrator {
  constructor() {
    this.currentConfig = this.getCurrentConfig();
    this.newConfig = {};
  }

  getCurrentConfig() {
    try {
      const clientPath = path.join(process.cwd(), 'src/integrations/supabase/client.ts');
      const clientContent = fs.readFileSync(clientPath, 'utf8');
      
      const urlMatch = clientContent.match(/supabaseUrl\s*=\s*["'](.*?)["']/);
      const keyMatch = clientContent.match(/supabaseAnonKey\s*=\s*["'](.*?)["']/);
      
      return {
        url: urlMatch ? urlMatch[1] : null,
        anonKey: keyMatch ? keyMatch[1] : null,
        projectRef: urlMatch ? urlMatch[1].match(/https:\/\/(.*?)\.supabase\.co/)?.[1] : null
      };
    } catch (error) {
      console.error('❌ Error reading current configuration:', error.message);
      return {};
    }
  }

  async collectNewCredentials() {
    console.log('\n🔧 Supabase Migration Setup');
    console.log('=====================================\n');
    
    console.log('📋 Current Configuration:');
    console.log(`   Project URL: ${this.currentConfig.url || 'Not found'}`);
    console.log(`   Project Ref: ${this.currentConfig.projectRef || 'Not found'}`);
    console.log(`   Anon Key: ${this.currentConfig.anonKey ? this.currentConfig.anonKey.substring(0, 20) + '...' : 'Not found'}\n`);
    
    this.newConfig.projectRef = await question('🆔 Enter new Supabase Project Reference ID: ');
    this.newConfig.url = `https://${this.newConfig.projectRef}.supabase.co`;
    this.newConfig.anonKey = await question('🔑 Enter new Supabase Anon Key: ');
    
    console.log('\n📝 New Configuration:');
    console.log(`   Project URL: ${this.newConfig.url}`);
    console.log(`   Project Ref: ${this.newConfig.projectRef}`);
    console.log(`   Anon Key: ${this.newConfig.anonKey.substring(0, 20)}...\n`);
    
    const confirm = await question('✅ Confirm migration with these credentials? (y/N): ');
    return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
  }

  async testConnection() {
    console.log('\n🔍 Testing connection to new Supabase project...');
    
    try {
      const supabase = createClient(this.newConfig.url, this.newConfig.anonKey);
      
      // Test basic connection
      const { data, error } = await supabase
        .from('employees')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          console.log('⚠️  Connection successful, but employees table not found.');
          console.log('   This is expected for a new project. You\'ll need to run migrations.');
          return { success: true, needsMigration: true };
        } else {
          throw error;
        }
      }
      
      console.log('✅ Connection successful! Employees table found.');
      console.log(`   Current employee count: ${data || 0}`);
      return { success: true, needsMigration: false };
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  updateClientConfig() {
    try {
      const clientPath = path.join(process.cwd(), 'src/integrations/supabase/client.ts');
      let clientContent = fs.readFileSync(clientPath, 'utf8');
      
      // Update URL
      clientContent = clientContent.replace(
        /supabaseUrl\s*=\s*["'].*?["']/,
        `supabaseUrl = "${this.newConfig.url}"`
      );
      
      // Update Anon Key
      clientContent = clientContent.replace(
        /supabaseAnonKey\s*=\s*["'].*?["']/,
        `supabaseAnonKey = "${this.newConfig.anonKey}"`
      );
      
      fs.writeFileSync(clientPath, clientContent);
      console.log('✅ Updated client.ts configuration');
      
    } catch (error) {
      console.error('❌ Error updating client.ts:', error.message);
      throw error;
    }
  }

  updateSupabaseConfig() {
    try {
      const configPath = path.join(process.cwd(), 'supabase/config.toml');
      
      if (fs.existsSync(configPath)) {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // Update project_id
        configContent = configContent.replace(
          /project_id\s*=\s*["'].*?["']/,
          `project_id = "${this.newConfig.projectRef}"`
        );
        
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Updated supabase/config.toml');
      } else {
        console.log('⚠️  supabase/config.toml not found, skipping...');
      }
      
    } catch (error) {
      console.error('❌ Error updating config.toml:', error.message);
    }
  }

  createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'migration-backup');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Backup client.ts
      const clientPath = path.join(process.cwd(), 'src/integrations/supabase/client.ts');
      const backupClientPath = path.join(backupDir, `client-${timestamp}.ts`);
      fs.copyFileSync(clientPath, backupClientPath);
      
      // Backup config.toml if exists
      const configPath = path.join(process.cwd(), 'supabase/config.toml');
      if (fs.existsSync(configPath)) {
        const backupConfigPath = path.join(backupDir, `config-${timestamp}.toml`);
        fs.copyFileSync(configPath, backupConfigPath);
      }
      
      console.log(`✅ Configuration backup created in migration-backup/`);
      
    } catch (error) {
      console.error('❌ Error creating backup:', error.message);
    }
  }

  async run() {
    try {
      console.log('🚀 Supabase Migration Tool');
      console.log('==========================\n');
      
      // Collect new credentials
      const confirmed = await this.collectNewCredentials();
      if (!confirmed) {
        console.log('❌ Migration cancelled.');
        rl.close();
        return;
      }
      
      // Test connection
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        console.log('❌ Migration aborted due to connection failure.');
        rl.close();
        return;
      }
      
      // Create backup
      console.log('\n💾 Creating configuration backup...');
      this.createBackup();
      
      // Update configuration files
      console.log('\n📝 Updating configuration files...');
      this.updateClientConfig();
      this.updateSupabaseConfig();
      
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next Steps:');
      
      if (connectionTest.needsMigration) {
        console.log('   1. Set up database schema in your new Supabase project');
        console.log('   2. Run: supabase link --project-ref ' + this.newConfig.projectRef);
        console.log('   3. Run: supabase db push (to apply migrations)');
        console.log('   4. Set up RLS policies (see SUPABASE-MIGRATION-GUIDE.md)');
        console.log('   5. Migrate your data from the old project');
      } else {
        console.log('   1. Test your application: npm run dev');
        console.log('   2. Verify all functionality works correctly');
      }
      
      console.log('   📖 See SUPABASE-MIGRATION-GUIDE.md for detailed instructions');
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
    } finally {
      rl.close();
    }
  }
}

// Run the migrator
const migrator = new SupabaseMigrator();
migrator.run().catch(console.error);