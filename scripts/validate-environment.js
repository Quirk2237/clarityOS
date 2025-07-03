#!/usr/bin/env node

/**
 * Environment Validation Script for ClarityOS AI Integration
 * Validates that all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating ClarityOS Environment Setup...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('\n📝 Creating .env.local template...');
  
  const envTemplate = `# ==========================================
# Supabase Configuration
# ==========================================
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# ==========================================
# Development Configuration
# ==========================================
NODE_ENV=development

# ==========================================
# NOTE: OpenAI API Key Configuration
# ==========================================
# The OpenAI API key is now configured as a Supabase secret.
# Set it using: pnpm supabase secrets set OPENAI_API_KEY sk-your-key-here
# This is more secure than storing it in local environment files.
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local template');
  console.log('\n🚨 IMPORTANT: Please update .env.local with your Supabase credentials');
  console.log('1. Get Supabase URL and anon key from your Supabase dashboard');
  console.log('2. Set OpenAI API key as Supabase secret: pnpm supabase secrets set OPENAI_API_KEY sk-your-key');
  process.exit(1);
}

// Load environment variables
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  // Parse .env file manually
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.log('⚠️  Could not load environment variables from .env.local');
}

// Validation checks
const checks = {
  supabaseUrl: {
    name: "Supabase URL",
    check: () => !!process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co',
    message: "EXPO_PUBLIC_SUPABASE_URL should be set with your Supabase project URL",
    critical: true
  },
  supabaseKey: {
    name: "Supabase Anon Key",
    check: () => !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here',
    message: "EXPO_PUBLIC_SUPABASE_ANON_KEY should be set with your Supabase anon key",
    critical: true
  },
  noPublicOpenAI: {
    name: "No Public OpenAI Key",
    check: () => !process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.EXPO_PUBLIC_OPENAI_API_KEY && !process.env.OPENAI_API_KEY,
    message: "OpenAI API key should NOT be in local environment (now handled as Supabase secret)",
    critical: true
  },
  nodeEnv: {
    name: "Node Environment",
    check: () => !!process.env.NODE_ENV,
    message: "NODE_ENV should be set (development/production)",
    critical: false
  }
};

let allPassed = true;
let criticalFailed = false;

console.log('🧪 Running Environment Checks...\n');

Object.entries(checks).forEach(([key, { name, check, message, critical }]) => {
  const passed = check();
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}: ${passed ? "PASS" : "FAIL"}`);
  
  if (!passed) {
    console.log(`   → ${message}`);
    allPassed = false;
    if (critical) {
      criticalFailed = true;
    }
  }
});

if (allPassed) {
  console.log("🎉 All environment checks passed! Your setup is ready.");
  console.log("\n✅ Next steps:");
  console.log("1. Ensure OpenAI API key is set as Supabase secret");
  console.log("2. Run: pnpm start");
  console.log("3. Test AI conversations in the app");
  console.log("4. Monitor console for any runtime errors");
} else if (criticalFailed) {
  console.log("🚨 CRITICAL: Some required environment variables are missing or invalid.");
  console.log("\n🔧 To fix:");
  console.log("1. Edit .env.local with your Supabase credentials");
  console.log("2. Get Supabase credentials from your project dashboard");
  console.log("3. Set OpenAI API key: pnpm supabase secrets set OPENAI_API_KEY sk-your-key");
  console.log("4. Re-run this script: node scripts/validate-environment.js");
  process.exit(1);
} else {
  console.log("⚠️  Some warnings detected, but your setup should work.");
  console.log("\n💡 Consider fixing the warnings above for optimal performance.");
}

console.log("\n📖 For detailed setup instructions: docs/ai-sdk-setup.md");
console.log("🔑 OpenAI API key is now managed as a Supabase secret for enhanced security"); 