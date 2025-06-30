import { View } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

export default function Settings() {
	const { signOut } = useAuth();

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: "#292929" }}>
			<View className="flex-1 p-4">
				{/* Header */}
				<View className="items-center mb-6">
					<H1 className="text-center text-white">Settings</H1>
				</View>

				{/* Coming Soon Message */}
				<View className="flex-1 items-center justify-center">
					<Text className="text-center text-white text-lg mb-8">
						Coming Soon
					</Text>
				</View>

				{/* Sign Out Button */}
				<View className="bg-white rounded-2xl p-5 shadow-lg">
					<Button
						variant="destructive"
						onPress={() => signOut()}
						className="w-full"
					>
						<Text className="text-white font-semibold">Sign Out</Text>
					</Button>
				</View>
			</View>
		</SafeAreaView>
	);
}
