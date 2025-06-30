import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useColorScheme } from "@/lib/useColorScheme";
import { duolingoColors } from "@/constants/colors";

// Simple icon components using emoji for now
const HomeIcon = ({ focused }: { focused: boolean }) => (
	<Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>🏠</Text>
);

const DashboardIcon = ({ focused }: { focused: boolean }) => (
	<Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>📊</Text>
);

const SettingsIcon = ({ focused }: { focused: boolean }) => (
	<Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>⚙️</Text>
);

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopWidth: 2,
					borderTopColor: duolingoColors.gray[200],
					height: 90,
					paddingBottom: 20,
					paddingTop: 8,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
					elevation: 8,
				},
				tabBarActiveTintColor: duolingoColors.primary.DEFAULT,
				tabBarInactiveTintColor: duolingoColors.gray[500],
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "600",
					marginTop: 4,
				},
				tabBarIconStyle: {
					marginBottom: -4,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarLabel: "Home",
					tabBarIcon: HomeIcon,
				}}
			/>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Dashboard",
					tabBarLabel: "Dashboard",
					tabBarIcon: DashboardIcon,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarLabel: "Settings",
					tabBarIcon: SettingsIcon,
				}}
			/>
		</Tabs>
	);
}
