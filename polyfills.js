import { Platform } from "react-native";
import structuredClone from "@ungap/structured-clone";

if (Platform.OS !== "web") {
	const setupPolyfills = async () => {
		const { polyfillGlobal } = await import(
			"react-native/Libraries/Utilities/PolyfillFunctions"
		);

		const { TextEncoderStream, TextDecoderStream } = await import(
			"@stardazed/streams-text-encoding"
		);

		if (!("structuredClone" in global)) {
			polyfillGlobal("structuredClone", () => structuredClone);
		}

		polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
		polyfillGlobal("TextDecoderStream", () => TextDecoderStream);

		if (!global.fetch) {
			const { fetch, Headers, Request, Response } = await import('react-native-url-polyfill/auto');
			polyfillGlobal('fetch', () => fetch);
			polyfillGlobal('Headers', () => Headers);
			polyfillGlobal('Request', () => Request);
			polyfillGlobal('Response', () => Response);
		}

		if (!global.ReadableStream) {
			try {
				const { ReadableStream } = await import('web-streams-polyfill/ponyfill');
				polyfillGlobal('ReadableStream', () => ReadableStream);
			} catch (error) {
				console.warn('ReadableStream polyfill not available:', error);
			}
		}

		if (!global.AbortController) {
			try {
				const { AbortController } = await import('abort-controller');
				polyfillGlobal('AbortController', () => AbortController);
			} catch (error) {
				console.warn('AbortController polyfill not available:', error);
			}
		}

		console.log('✅ AI SDK Polyfills loaded successfully');
	};

	setupPolyfills().catch(error => {
		console.error('❌ Failed to setup polyfills:', error);
	});
}

export {};
