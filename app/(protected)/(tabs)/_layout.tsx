import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { brandColors } from "@/constants/colors";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: brandColors.primary.DEFAULT,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: Platform.select({
					ios: {
						backgroundColor: "#292929", // Dark background
						borderTopColor: brandColors.gray[700], // Subtle border
						borderTopWidth: 1,
						height: 84, // Increase height to accommodate spacing
						paddingBottom: 8, // Add bottom padding
					},
					default: {
						backgroundColor: "#292929", // Dark background
						borderTopColor: brandColors.gray[700], // Subtle border
						borderTopWidth: 1,
						height: 70, // Increase height to accommodate spacing
						paddingBottom: 8, // Add bottom padding
					},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
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
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="gear" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
