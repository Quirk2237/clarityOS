import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import WelcomeIllustration from "@/assets/welcome.svg";

export default function WelcomeScreen() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleGetStarted = async () => {
		setIsLoading(true);
		// Small delay for better UX
		setTimeout(() => {
			router.replace("/");
			setIsLoading(false);
		}, 500);
	};

	return (
		<SafeAreaView className="flex flex-1" style={{ backgroundColor: "#ACFF64" }}>
			<View className="flex flex-1 items-center justify-center px-6 py-8">
				{/* Welcome Illustration */}
				<View className="flex-1 items-center justify-center">
					<WelcomeIllustration width="240" height="220" />
				</View>

				{/* Content Section */}
				<View className="items-center gap-y-4 mb-8">
					<H1 className="text-center text-4xl font-bold" style={{ color: "#292929" }}>
						ClarityOS
					</H1>
					<Muted 
						className="text-center px-4 leading-relaxed text-base" 
						style={{ color: "#292929" }}
					>
						Brand Strategy for the everyday{"\n"}business owner
					</Muted>
				</View>
			</View>

			{/* Button Section */}
			<View className="px-6 pb-8">
				<Button
					size="lg"
					onPress={handleGetStarted}
					className="w-full rounded-full py-4"
					style={{ backgroundColor: "#292929" }}
					disabled={isLoading}
				>
					<Text className="text-sm font-semibold text-green-500">
						{isLoading ? "Loading..." : "Get Started"}
					</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
