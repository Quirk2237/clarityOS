#!/usr/bin/env node

/**
 * Environment Test Script for ClarityOS
 * Tests environment variables and basic setup without React Native dependencies
 */

console.log('🧪 Testing ClarityOS Environment Setup...\n');

// Test 1: Environment variables
console.log('🔐 Testing environment variables...');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
	console.log('✅ .env.local file exists');
	
	// Load and check environment variables
	const envContent = fs.readFileSync(envPath, 'utf8');
	envContent.split('\n').forEach(line => {
		const trimmedLine = line.trim();
		if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
			const [key, ...valueParts] = trimmedLine.split('=');
			const value = valueParts.join('=').trim();
			process.env[key.trim()] = value;
		}
	});

	// Check for OpenAI API key in local environment (should NOT exist)
	if (process.env.OPENAI_API_KEY) {
		console.log('⚠️  OPENAI_API_KEY found in local environment - should be Supabase secret');
	} else {
		console.log('✅ OPENAI_API_KEY correctly not in local environment (using Supabase secret)');
	}

	if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co') {
		console.log('✅ EXPO_PUBLIC_SUPABASE_URL configured');
	} else {
		console.log('❌ EXPO_PUBLIC_SUPABASE_URL not configured or using placeholder value');
	}

	if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here') {
		console.log('✅ EXPO_PUBLIC_SUPABASE_ANON_KEY configured');
	} else {
		console.log('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY not configured or using placeholder value');
	}
} else {
	console.log('❌ .env.local file does not exist');
}

// Test 2: Package.json dependencies
console.log('\n📦 Testing package dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	
	// Check that AI SDK packages are removed
	const aiSdkPackages = ['@ai-sdk/openai', '@ai-sdk/react', 'ai'];
	const hasAiSdk = aiSdkPackages.some(pkg => packageJson.dependencies?.[pkg]);
	
	if (hasAiSdk) {
		console.log('⚠️  AI SDK packages still present - should be removed for simplified approach');
	} else {
		console.log('✅ AI SDK packages successfully removed');
	}
	
	// Check essential packages are still there
	if (packageJson.dependencies?.['zod']) {
		console.log('✅ zod package available for validation');
	} else {
		console.log('❌ zod package missing');
	}
	
	if (packageJson.dependencies?.['@supabase/supabase-js']) {
		console.log('✅ Supabase client available');
	} else {
		console.log('❌ Supabase client missing');
	}
} else {
	console.log('❌ package.json not found');
}

console.log('\n🎯 Test Summary:');
console.log('- Environment variables should be configured for Supabase');
console.log('- AI SDK packages should be removed for simplified approach');
console.log('- Essential packages (zod, supabase-js) should remain');
console.log('- OpenAI API key should be set as Supabase secret (not in local env)');

console.log('\n💡 Next steps:');
console.log('1. Verify Supabase credentials in .env.local');
console.log('2. Ensure OpenAI API key is set as Supabase secret');
console.log('3. Test simplified AI conversations in the app');
console.log('4. Run: pnpm test-ai-simplified'); 