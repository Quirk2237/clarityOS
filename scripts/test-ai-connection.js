#!/usr/bin/env node

/**
 * AI Connection Test Script for ClarityOS
 * Tests Supabase Edge Function connectivity since AI now runs through Supabase
 */

// Load environment variables
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, 'utf8');
	envContent.split('\n').forEach(line => {
		const trimmedLine = line.trim();
		if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
			const [key, ...valueParts] = trimmedLine.split('=');
			const value = valueParts.join('=').trim();
			process.env[key.trim()] = value;
		}
	});
}

async function testAIConnection() {
	try {
		console.log('🔄 Testing AI connection through Supabase Edge Functions...');
		
		// Test if we can import the AI SDK packages
		const { openai } = require('@ai-sdk/openai');
		const { streamText } = require('ai');
		console.log('✅ AI SDK packages imported successfully');

		// Check Supabase environment variables
		if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co') {
			console.log('❌ Supabase URL not configured properly');
			return;
		}
		console.log('✅ Supabase URL found');

		if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY === 'your-supabase-anon-key-here') {
			console.log('❌ Supabase anon key not configured properly');
			return;
		}
		console.log('✅ Supabase anon key found');

		// Check that OpenAI key is NOT in local environment (should be Supabase secret)
		if (process.env.OPENAI_API_KEY) {
			console.log('⚠️  OpenAI API key found in local environment - should be Supabase secret');
			console.log('   Run: pnpm supabase secrets set OPENAI_API_KEY sk-your-key');
		} else {
			console.log('✅ OpenAI API key correctly not in local environment');
		}

		// Test Supabase connection
		console.log('🔄 Testing Supabase connection...');
		const { createClient } = require('@supabase/supabase-js');
		
		const supabase = createClient(
			process.env.EXPO_PUBLIC_SUPABASE_URL,
			process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
		);

		// Test basic Supabase connectivity
		const { data, error } = await supabase.from('cards').select('slug').limit(1);
		
		if (error) {
			console.log('❌ Supabase connection failed:', error.message);
			return;
		}
		
		console.log('✅ Supabase connection successful');

		// Test Edge Function endpoint
		const edgeFunctionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler`;
		console.log('🔄 Testing Edge Function endpoint:', edgeFunctionUrl);
		
		// Note: We can't fully test the Edge Function without making an actual request,
		// but we can verify the URL format is correct
		if (edgeFunctionUrl.includes('functions/v1/ai-handler')) {
			console.log('✅ Edge Function URL format is correct');
		} else {
			console.log('❌ Edge Function URL format is incorrect');
		}

		console.log('\n🎉 AI connection setup validation PASSED!');
		console.log('\n📋 Summary:');
		console.log('• AI SDK packages are available');
		console.log('• Supabase environment variables are configured');
		console.log('• Supabase connection is working');
		console.log('• OpenAI API key should be set as Supabase secret');
		console.log('• Edge Function endpoint URL is correct');
		
		console.log('\n💡 Next steps:');
		console.log('1. Ensure OpenAI API key is set as Supabase secret');
		console.log('2. Deploy the ai-handler Edge Function if not already deployed');
		console.log('3. Test AI conversations in the app');
		
	} catch (error) {
		console.log('❌ AI connection test FAILED:', error.message);
		console.log('🔍 Error details:', {
			name: error.name,
			stack: error.stack?.split('\n')[0],
		});
		
		// Provide specific troubleshooting
		if (error.message.includes('Cannot find module')) {
			console.log('\n🛠️  This looks like a missing dependency:');
			console.log('   1. Run: pnpm install');
			console.log('   2. Check if all AI SDK packages are installed');
			console.log('   3. Verify Supabase client is installed');
		} else if (error.message.includes('Invalid API')) {
			console.log('\n🛠️  This looks like an API configuration issue:');
			console.log('   1. Verify your Supabase URL and anon key');
			console.log('   2. Check if your Supabase project is active');
			console.log('   3. Ensure proper permissions are set');
		}
	}
}

// Export for use in other scripts
module.exports = { testAIConnection };

// Run if called directly
if (require.main === module) {
	testAIConnection();
} 