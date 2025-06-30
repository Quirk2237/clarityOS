#!/usr/bin/env node

/**
 * AI SDK Setup Verification Script
 *
 * This script verifies that your AI SDK and environment setup is correct.
 * Run with: node scripts/verify-ai-setup.js
 */

console.log("🔍 Verifying AI SDK Setup...\n");

// Check environment variables
const checks = {
	openaiKey: {
		name: "OpenAI API Key",
		check: () => !!process.env.OPENAI_API_KEY,
		message: "OPENAI_API_KEY should be set for server-side use",
	},
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
		check: () => !process.env.NEXT_PUBLIC_OPENAI_API_KEY,
		message: "NEXT_PUBLIC_OPENAI_API_KEY should NOT be set (security risk)",
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

console.log("\n" + "=".repeat(50));

if (allPassed) {
	console.log("🎉 All checks passed! Your AI SDK setup is secure and ready.");
	console.log("\nNext steps:");
	console.log("1. Make sure you have real API keys in .env.local");
	console.log("2. Restart your development server: pnpm start");
	console.log("3. Test a brand discovery conversation");
} else {
	console.log("❌ Some checks failed. Please fix the issues above.");
	console.log("\nTo fix:");
	console.log("1. Update your .env.local file with correct variables");
	console.log("2. Remove any NEXT_PUBLIC_OPENAI_API_KEY references");
	console.log("3. Use EXPO_PUBLIC_ prefix for client-side variables only");
}

console.log("\n📖 See docs/ai-sdk-setup.md for detailed setup instructions.");
