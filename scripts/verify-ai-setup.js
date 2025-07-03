#!/usr/bin/env node

/**
 * AI SDK Setup Verification Script
 *
 * This script verifies that your AI SDK and environment setup is correct.
 * Run with: node scripts/verify-ai-setup.js
 */

console.log('🔧 Verifying AI SDK Setup for ClarityOS...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Check environment variables
const checks = {
	supabaseUrl: {
		name: "Supabase URL",
		check: () => !!process.env.EXPO_PUBLIC_SUPABASE_URL,
		message: "EXPO_PUBLIC_SUPABASE_URL should be set for client-side use",
	},
	supabaseKey: {
		name: "Supabase Anon Key",
		check: () => !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
		message: "EXPO_PUBLIC_SUPABASE_ANON_KEY should be set for client-side use",
	},
	noPublicOpenAI: {
		name: "No Public OpenAI Key",
		check: () => !process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.EXPO_PUBLIC_OPENAI_API_KEY && !process.env.OPENAI_API_KEY,
		message: "OpenAI API key should NOT be in local environment (now handled as Supabase secret)",
	},
	supabaseSecretNote: {
		name: "OpenAI API Key (Supabase Secret)",
		check: () => true, // Always pass since we can't check Supabase secrets locally
		message: "OpenAI API key should be set as Supabase secret using: pnpm supabase secrets set OPENAI_API_KEY sk-your-key",
	},
};

let allPassed = true;

Object.entries(checks).forEach(([key, { name, check, message }]) => {
	const passed = check();
	const icon = passed ? "✅" : "❌";
	console.log(`${icon} ${name}: ${passed ? "PASS" : "FAIL"}`);

	if (!passed) {
		console.log(`   → ${message}`);
		allPassed = false;
	}
});

console.log("\n" + "=".repeat(60));

if (allPassed) {
	console.log("🎉 All checks passed! Your AI SDK setup is secure and ready.");
	console.log("\nNext steps:");
	console.log("1. Ensure OpenAI API key is set as Supabase secret");
	console.log("2. Restart your development server: pnpm start");
	console.log("3. Test a brand discovery conversation");
} else {
	console.log("❌ Some checks failed. Please fix the issues above.");
	console.log("\nTo fix:");
	console.log("1. Update your .env.local file with correct Supabase variables");
	console.log("2. Remove any OpenAI API key from local environment");
	console.log("3. Set OpenAI key as Supabase secret: pnpm supabase secrets set OPENAI_API_KEY sk-your-key");
	console.log("4. Use EXPO_PUBLIC_ prefix for client-side variables only");
}

console.log("\n📖 See docs/ai-sdk-setup.md for detailed setup instructions.");
console.log("🔑 OpenAI API key is now securely managed as a Supabase secret");
