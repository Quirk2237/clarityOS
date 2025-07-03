import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { colors } from "@/constants/colors";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import TabBarBackground from "@/components/ui/tab-bar-background";

// Global event emitter for tab reset
let tabResetCallback: (() => void) | null = null;

export const registerTabResetCallback = (callback: () => void) => {
	tabResetCallback = callback;
};

export const unregisterTabResetCallback = () => {
	tabResetCallback = null;
};

// Wrapper component for tab bar background
const TabBarBackgroundWrapper = () => <TabBarBackground />;

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: colors.primary,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackgroundWrapper,
				tabBarLabelStyle: {
					fontFamily: 'FunnelSans-Medium', // Use Funnel font for tab labels
					fontSize: 12,
					marginTop: 4, // Add margin between icon and text
					marginBottom: Platform.OS === 'ios' ? 0 : 2,
				},
				tabBarIconStyle: {
					marginBottom: Platform.OS === 'ios' ? -2 : 0, // Adjust icon position
				},
				tabBarStyle: Platform.select({
					ios: {
						backgroundColor: 'transparent',
						borderTopWidth: 0,
						height: 84,
						paddingBottom: 8,
						position: 'absolute',
						elevation: 0,
						shadowColor: 'transparent', // Remove default shadow since BlurView handles it
					},
					default: {
						backgroundColor: 'transparent',
						borderTopWidth: 0,
						height: 70,
						paddingBottom: 8,
						position: 'absolute',
						elevation: 0,
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
				listeners={{
					tabPress: (e) => {
						// If there's a registered callback, call it to reset quiz state
						if (tabResetCallback) {
							tabResetCallback();
						}
					},
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
