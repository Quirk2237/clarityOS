import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { SafeAreaView } from "../components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "../components/ui/text";
import { Title, Caption } from "@/components/ui/typography";
import WelcomeIllustration from "@/assets/welcome.svg";
import { colors } from "@/constants/colors";
import { useAuth } from "../context/supabase-provider";

export default function WelcomeScreen() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { session } = useAuth();

	// Debug logging
	console.log('👋 Welcome Screen - Debug Info:', {
		hasSession: !!session,
		userId: session?.user?.id,
		userEmail: session?.user?.email
	});

	const handleGetStarted = async () => {
		console.log('🚀 Welcome Screen - Get Started clicked');
		setIsLoading(true);
		
		try {
			// Check if user is authenticated
			if (!session) {
				console.log('🚫 Welcome Screen - No session, redirecting to sign-in');
				router.replace("/sign-in");
				return;
			}

			console.log('✅ Welcome Screen - User authenticated, navigating to protected route');
			// Simply navigate to the protected route
			// The Supabase Provider will automatically handle routing logic:
			// - If user has brand info: goes to main app
			// - If user needs onboarding: goes to onboarding
			router.replace("/");
		} catch (error) {
			console.error('Error in handleGetStarted:', error);
			// Fallback navigation
			router.replace("/");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex flex-1" style={{ backgroundColor: colors.primary }}>
			<View className="flex flex-1 items-center justify-center px-6 py-8">
				{/* Welcome Illustration */}
				<View className="flex-1 items-center justify-center">
					<WelcomeIllustration width="240" height="220" />
				</View>

				{/* Content Section */}
				<View className="items-center gap-y-4 mb-8">
					<Title className="text-center text-4xl font-bold" style={{ color: colors.surface }}>
						mouse
					</Title>
					<Caption 
						className="text-center px-4 leading-relaxed text-base" 
						style={{ color: colors.surface }}
					>
						Pointing you in the right direction
					</Caption>
				</View>
			</View>

			{/* Button Section */}
			<View className="px-6 pb-8">
				<Button
					size="lg"
					onPress={handleGetStarted}
					className="w-full rounded-full py-4 bg-black"
					disabled={isLoading}
				>
					<Text className="text-subtitle font-semibold text-white">
						{isLoading ? "Loading..." : session ? "Get Started" : "Sign In to Continue"}
					</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
