#!/usr/bin/env node

/**
 * Docker-Free Edge Function Deployment Script
 * Prioritizes MCP tools over local CLI commands that require Docker
 */

console.log('🚀 ClarityOS Edge Function Deployment');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
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

function checkDockerAvailable() {
	try {
		execSync('docker --version', { stdio: 'ignore' });
		execSync('docker info', { stdio: 'ignore' });
		return true;
	} catch (error) {
		return false;
	}
}

function checkSupabaseCLI() {
	try {
		execSync('pnpm supabase --version', { stdio: 'ignore' });
		return true;
	} catch (error) {
		return false;
	}
}

async function deployEdgeFunction() {
	console.log('\n🔍 Checking deployment options...\n');

	// Option 1: MCP Tools (Preferred - No Docker Required)
	console.log('🎯 PREFERRED METHOD: Supabase MCP Tools');
	console.log('✅ No Docker dependency');
	console.log('✅ Cross-platform compatibility');  
	console.log('✅ Better error handling');
	console.log('✅ Integrated debugging');
	console.log('\n💡 How to use MCP deployment:');
	console.log('   1. Open your AI assistant (Cursor, etc.)');
	console.log('   2. Ask: "Please deploy the ai-handler Edge Function using MCP"');
	console.log('   3. The AI will use mcp_supabase_deploy_edge_function automatically');
	console.log('\n📋 MCP Benefits:');
	console.log('   • Works without Docker Desktop');
	console.log('   • No container setup required');
	console.log('   • Direct Supabase API integration');
	console.log('   • Real-time deployment status');

	// Option 2: CLI (Fallback - Requires Docker)
	const dockerAvailable = checkDockerAvailable();
	const supabaseCLIAvailable = checkSupabaseCLI();

	console.log('\n🔄 ALTERNATIVE METHOD: Local CLI');
	console.log(`Docker Available: ${dockerAvailable ? '✅' : '❌'}`);
	console.log(`Supabase CLI: ${supabaseCLIAvailable ? '✅' : '❌'}`);

	if (dockerAvailable && supabaseCLIAvailable) {
		console.log('\n🐳 Docker deployment available but not recommended');
		console.log('   Command: pnpm supabase functions deploy ai-handler');
		console.log('   Issues: Requires Docker Desktop, slower, platform-specific');
		
		// Ask user preference
		console.log('\n❓ Would you like to proceed with Docker deployment? (not recommended)');
		console.log('   Press Ctrl+C to cancel and use MCP instead');
		console.log('   Or wait 10 seconds to automatically use MCP instructions...');
		
		await new Promise(resolve => setTimeout(resolve, 10000));
		console.log('\n✅ Timeout reached - showing MCP instructions instead');
	} else {
		console.log('\n❌ Local CLI deployment not available:');
		if (!dockerAvailable) {
			console.log('   • Docker Desktop is not running');
			console.log('   • Install Docker: https://docs.docker.com/desktop/');
		}
		if (!supabaseCLIAvailable) {
			console.log('   • Supabase CLI not available');
			console.log('   • Install CLI: npm install -g supabase');
		}
	}

	// Final recommendation
	console.log('\n🎯 RECOMMENDED NEXT STEPS:');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('1. 💬 Open your AI assistant (Cursor, ChatGPT, etc.)');
	console.log('2. 📨 Send this message:');
	console.log('   "Deploy the ai-handler Edge Function using Supabase MCP tools"');
	console.log('3. ✅ The AI will handle deployment without Docker');
	console.log('4. 🔍 Verify deployment in Supabase Dashboard → Edge Functions');
	
	console.log('\n🔗 Alternative: Manual Dashboard Deployment');
	console.log('1. 🌐 Go to your Supabase Dashboard');
	console.log('2. 📁 Navigate to Edge Functions');
	console.log('3. ➕ Create new function or edit existing ai-handler');
	console.log('4. 📋 Copy code from supabase/functions/ai-handler/index.ts');
	console.log('5. 🚀 Deploy directly from the dashboard');

	console.log('\n🎉 MCP deployment is the future of serverless development!');
	console.log('   No Docker, no hassle, just results. 🚀');
}

// Check if this is being run directly
if (require.main === module) {
	deployEdgeFunction().catch(error => {
		console.error('\n❌ Deployment script error:', error.message);
		console.log('\n💡 Fallback: Use MCP tools or Supabase Dashboard for deployment');
		process.exit(1);
	});
}

module.exports = { deployEdgeFunction, checkDockerAvailable, checkSupabaseCLI }; 