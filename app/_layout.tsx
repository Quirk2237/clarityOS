import "../polyfills";
import "../global.css";

import { Stack } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AuthProvider } from "../context/supabase-provider";
import { colors } from "@/constants/colors";
import { useCustomFonts } from "@/lib/fonts";

// Disable Reanimated strict mode warnings
if (typeof global !== "undefined") {
	// @ts-ignore
	global._WORKLET = false;
	// @ts-ignore
	global.__reanimatedLoggerConfig = {
		strict: false,
		level: "warn",
	};
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
	const fontsLoaded = useCustomFonts();
	
	useEffect(() => {
		if (fontsLoaded) {
			console.log('🚀 App ready with Funnel fonts - hiding splash screen');
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
				<Stack.Screen name="(protected)" />
				<Stack.Screen name="welcome" />
				<Stack.Screen name="onboarding" />
				<Stack.Screen
					name="sign-up"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign Up",
						headerStyle: {
							backgroundColor: colors.background,
						},
						headerTintColor: colors.text,
						gestureEnabled: true,
					}}
				/>
				<Stack.Screen
					name="sign-in"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign In",
						headerStyle: {
							backgroundColor: colors.background,
						},
						headerTintColor: colors.text,
						gestureEnabled: true,
					}}
				/>
			</Stack>
		</AuthProvider>
	);
}
