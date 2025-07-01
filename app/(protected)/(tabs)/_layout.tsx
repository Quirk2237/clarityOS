import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { colors } from "@/constants/colors";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.primary,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: Platform.select({
					ios: {
						backgroundColor: colors.surface,
						borderTopColor: colors.border,
						borderTopWidth: 1,
						height: 84, // Increase height to accommodate spacing
						paddingBottom: 8, // Add bottom padding
					},
					default: {
						backgroundColor: colors.surface,
						borderTopColor: colors.border,
						borderTopWidth: 1,
						height: 70, // Increase height to accommodate spacing
						paddingBottom: 8, // Add bottom padding
					},
				}),
			}}
		>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="gear" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="index"
				options={{
					title: "Cards",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="square" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="chart.bar.fill" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
