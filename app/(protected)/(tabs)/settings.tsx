import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

interface SettingsItemProps {
	title: string;
	subtitle?: string;
	icon: string;
	onPress: () => void;
	showChevron?: boolean;
	destructive?: boolean;
}

const SettingsItem = ({
	title,
	subtitle,
	icon,
	onPress,
	showChevron = true,
	destructive = false,
}: SettingsItemProps) => (
	<Pressable
		onPress={onPress}
		className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3 active:scale-98"
	>
		<View className="flex-row items-center">
			<View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
				<Text className="text-lg">{icon}</Text>
			</View>
			<View className="flex-1">
				<Text
					className={`font-semibold ${destructive ? "text-red-500" : "text-gray-800"}`}
				>
					{title}
				</Text>
				{subtitle && (
					<Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
				)}
			</View>
			{showChevron && <Text className="text-gray-400 text-lg">›</Text>}
		</View>
	</Pressable>
);

export default function Settings() {
	const { signOut, session } = useAuth();

	const handleSignOut = async () => {
		await signOut();
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-6">
					{/* Header */}
					<View className="items-center mb-2">
						<H1 className="text-center text-foreground">Settings</H1>
						<Muted className="text-center">
							Manage your account and preferences
						</Muted>
					</View>

					{/* User Profile Section */}
					<View className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-200">
						<H2 className="text-gray-800 mb-4">Profile</H2>
						<View className="flex-row items-center mb-4">
							<View className="w-16 h-16 rounded-full bg-primary items-center justify-center mr-4">
								<Text className="text-white text-2xl font-bold">
									{session?.user?.email?.charAt(0).toUpperCase() || "U"}
								</Text>
							</View>
							<View className="flex-1">
								<Text className="font-semibold text-gray-800 text-lg">
									{session?.user?.user_metadata?.full_name || "Brand Builder"}
								</Text>
								<Text className="text-gray-500">
									{session?.user?.email || "user@example.com"}
								</Text>
							</View>
						</View>
					</View>

					{/* Account Settings */}
					<View>
						<H2 className="text-gray-800 mb-3">Account Settings</H2>
						<SettingsItem
							icon="👤"
							title="Name"
							subtitle="Update your display name"
							onPress={() => {
								/* Navigate to name edit */
							}}
						/>
						<SettingsItem
							icon="✉️"
							title="Email"
							subtitle={session?.user?.email || "Update your email address"}
							onPress={() => {
								/* Navigate to email edit */
							}}
						/>
						<SettingsItem
							icon="🔒"
							title="Password"
							subtitle="Change your password"
							onPress={() => {
								/* Navigate to password change */
							}}
						/>
					</View>

					{/* App Settings */}
					<View>
						<H2 className="text-gray-800 mb-3">App Settings</H2>
						<SettingsItem
							icon="🔔"
							title="Notifications"
							subtitle="Manage your notification preferences"
							onPress={() => {
								/* Navigate to notifications */
							}}
						/>
						<SettingsItem
							icon="🌙"
							title="Dark Mode"
							subtitle="Toggle dark mode appearance"
							onPress={() => {
								/* Toggle dark mode */
							}}
						/>
						<SettingsItem
							icon="📱"
							title="Data & Privacy"
							subtitle="Manage your data and privacy settings"
							onPress={() => {
								/* Navigate to privacy settings */
							}}
						/>
					</View>

					{/* Support */}
					<View>
						<H2 className="text-gray-800 mb-3">Support</H2>
						<SettingsItem
							icon="💬"
							title="Feedback"
							subtitle="Send us your thoughts and suggestions"
							onPress={() => {
								/* Navigate to feedback */
							}}
						/>
						<SettingsItem
							icon="❓"
							title="Help & Support"
							subtitle="Get help with using the app"
							onPress={() => {
								/* Navigate to help */
							}}
						/>
						<SettingsItem
							icon="ℹ️"
							title="About"
							subtitle="App version and information"
							onPress={() => {
								/* Navigate to about */
							}}
						/>
					</View>

					{/* Sign Out */}
					<View className="mt-4">
						<Button
							variant="destructive"
							size="lg"
							onPress={handleSignOut}
							className="w-full"
						>
							<Text className="text-white font-semibold">Sign Out</Text>
						</Button>
					</View>

					{/* Footer space */}
					<View className="h-8" />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
