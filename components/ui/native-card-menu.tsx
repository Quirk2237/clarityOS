import React from "react";
import { Platform, Alert, ActionSheetIOS } from "react-native";

interface NativeCardMenuProps {
	cardName: string;
	onStartOver: () => void;
}

export function showNativeCardMenu({ cardName, onStartOver }: NativeCardMenuProps) {
	// Add haptic feedback for better user experience (iOS/Android)
	try {
		import('expo-haptics').then((Haptics) => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}).catch(() => {
			// Haptics not available, continue without
		});
	} catch (error) {
		// Haptics not available, continue without
	}
	
	if (Platform.OS === 'ios') {
		// Use iOS-native Action Sheet
		ActionSheetIOS.showActionSheetWithOptions(
			{
				options: ['Cancel', 'Start Over'],
				cancelButtonIndex: 0,
				destructiveButtonIndex: 1,
				title: `${cardName} Options`,
				message: 'Choose an action for this card',
				userInterfaceStyle: 'dark', // Support dark mode
			},
			(buttonIndex) => {
				if (buttonIndex === 1) {
					// Show native confirmation dialog
					showNativeConfirmation(cardName, onStartOver);
				}
			}
		);
	} else {
		// For Android, go directly to confirmation
		// (Android doesn't have a native action sheet, so we use the confirmation directly)
		showNativeConfirmation(cardName, onStartOver);
	}
}

function showNativeConfirmation(cardName: string, onStartOver: () => void) {
	// Use React Native's built-in Alert - 100% native on both platforms
	Alert.alert(
		"Start Over?",
		`This will permanently delete all your progress for "${cardName}". You'll need to start from the beginning.`,
		[
			{
				text: "Cancel",
				style: "cancel"
			},
			{
				text: "Start Over",
				style: "destructive", // Red text on iOS, standard on Android
				onPress: onStartOver
			}
		],
		{ 
			cancelable: true,
			userInterfaceStyle: 'dark' // iOS dark mode support
		}
	);
} 