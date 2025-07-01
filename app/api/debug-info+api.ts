export async function GET() {
	try {
		const debugInfo = {
			hasOpenAI: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here'),
			hasSupabase: !!(
				process.env.EXPO_PUBLIC_SUPABASE_URL && 
				process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
				process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
				process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here'
			),
			nodeEnv: process.env.NODE_ENV || 'unknown',
			timestamp: new Date().toISOString(),
			serverInfo: {
				platform: process.platform,
				nodeVersion: process.version,
				memoryUsage: process.memoryUsage(),
			}
		};

		// Log debug info for server-side debugging
		console.log('🔍 Debug Info Request:', {
			hasOpenAI: debugInfo.hasOpenAI,
			hasSupabase: debugInfo.hasSupabase,
			nodeEnv: debugInfo.nodeEnv,
			openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
			openaiKeyPrefix: process.env.OPENAI_API_KEY?.slice(0, 8) || 'none',
		});

		return Response.json(debugInfo);
	} catch (error) {
		console.error('Debug info API error:', error);
		return Response.json(
			{
				hasOpenAI: false,
				hasSupabase: false,
				nodeEnv: 'error',
				timestamp: new Date().toISOString(),
				error: 'Failed to retrieve debug info'
			},
			{ status: 500 }
		);
	}
} 