import { Redirect, Stack } from "expo-router";

import { useAuth } from "../../context/supabase-provider";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function ProtectedLayout() {
	const { initialized } = useAuth();

	if (!initialized) {
		return null;
	}

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
		</Stack>
	);
}
