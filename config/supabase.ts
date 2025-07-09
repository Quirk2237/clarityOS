import { AppState, Platform } from "react-native";

import "react-native-get-random-values";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Helper function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
	if (Platform.OS !== 'web') return false;
	
	try {
		return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
	} catch {
		return false;
	}
};

// Web-compatible storage that falls back to in-memory storage
class WebStorage {
	private memoryStorage: Map<string, string> = new Map();

	getItem(key: string): string | null {
		if (isLocalStorageAvailable()) {
			return localStorage.getItem(key);
		}
		return this.memoryStorage.get(key) || null;
	}

	setItem(key: string, value: string): void {
		if (isLocalStorageAvailable()) {
			localStorage.setItem(key, value);
		} else {
			this.memoryStorage.set(key, value);
		}
	}

	removeItem(key: string): void {
		if (isLocalStorageAvailable()) {
			localStorage.removeItem(key);
		} else {
			this.memoryStorage.delete(key);
		}
	}
}

class LargeSecureStore {
	private webStorage = new WebStorage();

	private async _encrypt(key: string, value: string) {
		// On web, skip encryption for simplicity (localStorage is used directly)
		if (Platform.OS === 'web') {
			return value;
		}
		
		const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
		const cipher = new aesjs.ModeOfOperation.ctr(
			encryptionKey,
			new aesjs.Counter(1),
		);
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
		await SecureStore.setItemAsync(
			key,
			aesjs.utils.hex.fromBytes(encryptionKey),
		);
		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}
	private async _decrypt(key: string, value: string) {
		// On web, skip decryption for simplicity
		if (Platform.OS === 'web') {
			return value;
		}
		
		const encryptionKeyHex = await SecureStore.getItemAsync(key);
		if (!encryptionKeyHex) {
			return encryptionKeyHex;
		}
		const cipher = new aesjs.ModeOfOperation.ctr(
			aesjs.utils.hex.toBytes(encryptionKeyHex),
			new aesjs.Counter(1),
		);
		const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
		return aesjs.utils.utf8.fromBytes(decryptedBytes);
	}
	async getItem(key: string) {
		if (Platform.OS === 'web') {
			return this.webStorage.getItem(key);
		}
		
		const encrypted = await AsyncStorage.getItem(key);
		if (!encrypted) {
			return encrypted;
		}
		return await this._decrypt(key, encrypted);
	}
	async removeItem(key: string) {
		if (Platform.OS === 'web') {
			this.webStorage.removeItem(key);
			return;
		}
		
		await AsyncStorage.removeItem(key);
		await SecureStore.deleteItemAsync(key);
	}
	async setItem(key: string, value: string) {
		if (Platform.OS === 'web') {
			this.webStorage.setItem(key, value);
			return;
		}
		
		const encrypted = await this._encrypt(key, value);
		await AsyncStorage.setItem(key, encrypted);
	}
}

// Function to get runtime environment variables
const getRuntimeEnvVars = () => {
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
	
	// Log the values for debugging
	console.log('🔧 Supabase Config Debug:', {
		url: supabaseUrl,
		hasKey: !!supabaseAnonKey,
		urlIsPlaceholder: supabaseUrl === 'https://placeholder.supabase.co',
		keyIsPlaceholder: supabaseAnonKey === 'placeholder-anon-key'
	});
	
	// Only use placeholders if no environment variables are available at all
	if (!supabaseUrl || !supabaseAnonKey) {
		console.warn('⚠️ Supabase environment variables not found, using placeholders');
		return {
			url: 'https://placeholder.supabase.co',
			key: 'placeholder-anon-key'
		};
	}
	
	return {
		url: supabaseUrl,
		key: supabaseAnonKey
	};
};

// Create Supabase client with runtime environment variables
const { url: supabaseUrl, key: supabaseAnonKey } = getRuntimeEnvVars();

let supabase: ReturnType<typeof createClient>;

try {
	supabase = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			storage: new LargeSecureStore(),
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: Platform.OS === 'web',
		},
	});
	
	console.log('✅ Supabase client created successfully');
} catch (error) {
	console.error('❌ Failed to create Supabase client:', error);
	// Create a dummy client for build process
	supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
		auth: {
			storage: new LargeSecureStore(),
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false,
		},
	});
}

export { supabase };

// Only add AppState listener on mobile platforms
if (Platform.OS !== 'web') {
	AppState.addEventListener("change", (state) => {
		if (state === "active") {
			supabase.auth.startAutoRefresh();
		} else {
			supabase.auth.stopAutoRefresh();
		}
	});
}
