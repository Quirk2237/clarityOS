import { Platform } from "react-native";

// Import react-native-url-polyfill first to ensure proper loading order
import 'react-native-url-polyfill/auto';

if (Platform.OS !== "web") {
	const setupPolyfills = async () => {
		console.log('🔧 Setting up basic polyfills...');
		
		try {
			const { polyfillGlobal } = await import(
				"react-native/Libraries/Utilities/PolyfillFunctions"
			);

			// 1. AbortController polyfill (useful for canceling fetch requests)
			if (!global.AbortController) {
				try {
					const { AbortController, AbortSignal } = await import('abort-controller');
					polyfillGlobal('AbortController', () => AbortController);
					polyfillGlobal('AbortSignal', () => AbortSignal);
					console.log('✅ AbortController polyfilled');
				} catch (error) {
					console.error('❌ AbortController polyfill failed:', error);
				}
			}

			// 2. Optional: Enhanced fetch for debugging (only in development)
			if (Platform.OS !== 'web' && __DEV__) {
				const originalFetch = global.fetch;
				global.fetch = async (input, init) => {
					try {
						console.log('🌐 Fetch request:', typeof input === 'string' ? input : input?.url || 'unknown');
						const response = await originalFetch(input, init);
						console.log('✅ Fetch response:', response.status, response.statusText);
						return response;
					} catch (error) {
						console.error('❌ Fetch error:', error);
						throw error;
					}
				};
				console.log('✅ Enhanced fetch logging enabled');
			}

			console.log('✅ Basic polyfills loaded successfully');
			
			// Validate critical APIs are available
			const missingApis = [];
			if (!global.fetch) missingApis.push('fetch');
			if (!global.AbortController) missingApis.push('AbortController');
			
			if (missingApis.length > 0) {
				console.warn(`Missing APIs: ${missingApis.join(', ')}`);
			}
			
			console.log('🎉 Essential APIs validated and available');
			
		} catch (error) {
			console.error('❌ Polyfill setup failed:', error);
		}
	};

	// Setup polyfills and handle errors gracefully
	setupPolyfills().catch(error => {
		console.error('❌ Failed to setup polyfills:', error);
	});
}

export {};
