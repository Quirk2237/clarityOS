#!/usr/bin/env node

/**
 * Simplified Polyfills Test Script for ClarityOS
 * Tests if essential polyfills and environment setup are working correctly for Expo/React Native
 * Updated for simplified AI flow without AI SDK dependencies
 */

// Set up polyfills first (like in the app)
require('../polyfills.js');

console.log('🧪 Testing ClarityOS Simplified Environment...\n');

// Test 1: Essential APIs
console.log('🌐 Testing essential APIs...');

if (typeof fetch !== 'undefined') {
	console.log('✅ fetch available');
} else {
	console.log('❌ fetch missing');
}

if (typeof AbortController !== 'undefined') {
	console.log('✅ AbortController available');
} else {
	console.log('❌ AbortController missing');
}

// Test 2: Crypto support (still needed for general app functionality)
console.log('\n🔐 Testing crypto support...');
if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
	try {
		const array = new Uint8Array(16);
		crypto.getRandomValues(array);
		console.log('✅ crypto.getRandomValues working');
	} catch (error) {
		console.log('❌ crypto.getRandomValues failed:', error.message);
	}
} else {
	console.log('❌ crypto.getRandomValues not available');
}

// Test 3: Environment variables
console.log('\n🔐 Testing environment variables...');
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

console.log('\n🎯 Test Summary:');
console.log('- Essential APIs (fetch, AbortController) should be available');
console.log('- Supabase environment variables should be configured');
console.log('- OpenAI API key should be set as Supabase secret (not in local env)');
console.log('- No AI SDK dependencies needed for simplified approach');

console.log('\n💡 Next steps:');
console.log('1. Fix any missing essential APIs by updating polyfills.js');
console.log('2. Verify Supabase credentials in .env.local');
console.log('3. Ensure OpenAI API key is set as Supabase secret');
console.log('4. Test simplified AI conversations in the app'); 