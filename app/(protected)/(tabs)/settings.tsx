import { View } from "react-native";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { colors } from "@/constants/colors";
import { useProfileStore } from "../../../stores/profile-store";
import { supabase } from "@/config/supabase";
import { Button } from "../../../components/ui/button";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function SettingsScreen() {
	const { profile, updateProfile } = useProfileStore();
	const [isResetting, setIsResetting] = useState(false);
	const router = useRouter();

	const handleResetOnboarding = async () => {
		if (!profile?.id) return;
		
		setIsResetting(true);
		try {
			await updateProfile({
				brand_name: undefined,
				brand_description: undefined
			});
			
			// Navigate back to root to trigger onboarding
			router.replace("/");
		} catch (error) {
			console.error('Error resetting onboarding:', error);
		} finally {
			setIsResetting(false);
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
			<View className="flex-1 justify-center items-center">
				<Text className="text-2xl font-semibold text-gray-600">Coming Soon</Text>
			</View>
			
			{/* Development Section - Only show in development */}
			{__DEV__ && (
				<View className="p-6 border-t border-gray-700">
					<Text className="text-white text-lg font-semibold mb-4">
						Development Tools
					</Text>
					<Button
						onPress={handleResetOnboarding}
						disabled={isResetting}
						className="bg-red-600 mb-2"
					>
						<Text className="text-white font-medium">
							{isResetting ? "Resetting..." : "Reset Onboarding"}
						</Text>
					</Button>
					<Text className="text-gray-400 text-sm">
						This will clear your brand info and show the onboarding screen again
					</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
