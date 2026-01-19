/**
 * Environment Setup Script
 * 
 * This script copies .env.development to .env, overwriting any existing .env file.
 * It's designed to be run automatically via Husky hooks to ensure
 * developers have the necessary environment file after cloning or pulling.
 * 
 * Usage:
 *   npx ts-node --project scripts/tsconfig.json scripts/setup-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Main function to set up .env file from .env.development
 */
function setupEnv(): void {
  const rootDir = process.cwd();
  const envDevelopmentPath = path.join(rootDir, '.env.development');
  const envPath = path.join(rootDir, '.env');

  console.log('🔧 Setting up environment file...');

  // Check if .env.development exists
  if (!fs.existsSync(envDevelopmentPath)) {
    console.log('⚠️  .env.development not found. Skipping setup.');
    return;
  }

  // Check if .env already exists and will be overwritten
  const envExists = fs.existsSync(envPath);
  if (envExists) {
    console.log('⚠️  .env already exists. It will be overwritten with .env.development');
  }

  try {
    // Read .env.development
    const envContent = fs.readFileSync(envDevelopmentPath, 'utf-8');
    
    // Write to .env (overwrites if exists)
    fs.writeFileSync(envPath, envContent, 'utf-8');
    
    if (envExists) {
      console.log('✨ Successfully overwrote .env with .env.development');
    } else {
      console.log('✨ Successfully created .env from .env.development');
    }
  } catch (error) {
    console.error('❌ Error setting up .env file:', error);
    process.exit(1);
  }
}

// Run the setup
setupEnv();
