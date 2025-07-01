import React from "react";
import { View, Pressable } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Button } from "@/components/ui/button";
import { Database } from "../../lib/database.types";
import { colors } from "@/constants/colors";

type Card = Database["public"]["Tables"]["cards"]["Row"];

interface QuizCompletionModalProps {
	card: Card;
	score: number;
	onProceedToDiscovery: () => void;
	onBackToHome: () => void;
	onClose: () => void;
}

export function QuizCompletionModal({
	card,
	score,
	onProceedToDiscovery,
	onBackToHome,
	onClose,
}: QuizCompletionModalProps) {
	const cardName = card.name.toUpperCase();
	
	return (
		<SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center px-4">
			{/* Centered Card Container */}
			<View 
				className="w-full max-w-xl rounded-3xl p-6 shadow-lg" 
				style={{ backgroundColor: colors.primary }}
			>
				{/* Close Button */}
				<View style={{ position: 'absolute', left: 20, top: 20, zIndex: 10 }}>
					<Button
						variant="white"
						size="icon"
						onPress={onClose}
						className="w-12 h-12 rounded-full items-center justify-center"
						style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
					>
						<Text className="text-2xl text-black">✕</Text>
					</Button>
				</View>

				{/* Content Container */}
				<View className="items-center" style={{ paddingTop: 40 }}>
					{/* Badge */}
					<View className="mb-8">
						<View 
							className="w-24 h-24 rounded-full border-4 border-white items-center justify-center"
							style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
						>
							<View className="w-16 h-16 rounded-full border-2 items-center justify-center"
								style={{ borderColor: colors.primary }}
							>
								<Text className="text-black font-bold text-xs text-center leading-tight">
									{cardName}{'\n'}MASTER
								</Text>
							</View>
						</View>
					</View>

					{/* Congratulations */}
					<Text className="text-4xl font-bold text-black text-center mb-2">
						Congratulations!
					</Text>
					
					<Text className="text-xl text-black text-center mb-8">
						You nailed {card.name}!
					</Text>

					{/* Description */}
					<Text className="text-lg text-black text-center leading-relaxed mb-10 px-4">
						Next, clarify your own brand's {card.name.toLowerCase()} to connect deeply with customers and grow your business
					</Text>

					{/* Main Action Button */}
					<Pressable
						onPress={onProceedToDiscovery}
						className="w-full rounded-2xl py-4 items-center justify-center mb-6"
						style={{ 
							backgroundColor: "rgba(255, 255, 255, 1)",
							minHeight: 56,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.1,
							shadowRadius: 8,
							elevation: 3,
						}}
					>
						<Text className="font-semibold text-lg text-black">
							Clarify my brand {card.name.toLowerCase()}
						</Text>
					</Pressable>

					{/* Back to Home */}
					<Pressable onPress={onBackToHome}>
						<Text className="text-black font-medium text-lg">
							Back to Home
						</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
} 