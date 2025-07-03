export async function GET() {
	try {
		const debugInfo = {
			hasSupabase: !!(
				process.env.EXPO_PUBLIC_SUPABASE_URL && 
				process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
				process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
				process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key-here'
			),
			openaiKeyLocation: process.env.OPENAI_API_KEY ? 'local_environment' : 'supabase_secret',
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
			hasSupabase: debugInfo.hasSupabase,
			openaiKeyLocation: debugInfo.openaiKeyLocation,
			nodeEnv: debugInfo.nodeEnv,
			timestamp: debugInfo.timestamp,
		});

		return Response.json(debugInfo);
	} catch (error) {
		console.error('Debug info API error:', error);
		return Response.json(
			{
				hasSupabase: false,
				openaiKeyLocation: 'unknown',
				nodeEnv: 'error',
				timestamp: new Date().toISOString(),
				error: 'Failed to retrieve debug info'
			},
			{ status: 500 }
		);
	}
} 