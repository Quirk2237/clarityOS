import "../polyfills";
import "../global.css";

import { Stack } from "expo-router";
import {
	useFonts,
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
} from "@expo-google-fonts/inter";
import Feather from '@expo/vector-icons/Feather';
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AuthProvider } from "@/context/supabase-provider";
import { colors } from "@/constants/colors";

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
	const [fontsLoaded] = useFonts({
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
		...Feather.font,
	});

	useEffect(() => {
		if (fontsLoaded) {
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
				<Stack.Screen
					name="sign-up"
					options={{
						presentation: "modal",
						headerShown: true,
						headerTitle: "Sign Up",
						headerStyle: {
							backgroundColor: colors.background,
						},
						headerTintColor: colors.foreground,
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
						headerTintColor: colors.foreground,
						gestureEnabled: true,
					}}
				/>
			</Stack>
		</AuthProvider>
	);
}
