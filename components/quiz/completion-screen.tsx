import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Button } from "@/components/ui/button";
import { Title, Subtitle, Caption } from "@/components/ui/typography";
import { Database } from "../../lib/database.types";
import { colors } from "@/constants/colors";

type Card = Database["public"]["Tables"]["cards"]["Row"];

interface CompletionScreenProps {
	card: Card;
	finalScore: number;
	onContinue: () => void;
}

export function CompletionScreen({
	card,
	finalScore,
	onContinue,
}: CompletionScreenProps) {
	const getScoreMessage = (score: number) => {
		if (score >= 95)
			return { emoji: "🏆", message: "Perfect!", color: colors.primary };
		if (score >= 85)
			return { emoji: "🌟", message: "Excellent!", color: colors.primary };
		if (score >= 75)
			return { emoji: "🎯", message: "Great job!", color: colors.primary };
		if (score >= 65)
			return { emoji: "👍", message: "Well done!", color: colors.primary };
		return { emoji: "💪", message: "Keep learning!", color: colors.primary };
	};

	const getNextCardMessage = (cardName: string) => {
		const cardOrder = [
			"Purpose",
			"Positioning",
			"Personality",
			"Product-Market Fit",
			"Perception",
			"Presentation",
			"Proof",
		];
		const currentIndex = cardOrder.indexOf(cardName);

		if (currentIndex === -1 || currentIndex === cardOrder.length - 1) {
			return "You&apos;ve completed your brand clarity journey! 🎉";
		}

		const nextCard = cardOrder[currentIndex + 1];
		return `Next up: ${nextCard} Mastery! 🚀`;
	};

	const scoreData = getScoreMessage(finalScore);
	const nextMessage = getNextCardMessage(card.name);

	return (
		<SafeAreaView className="flex-1 bg-neutral-900">
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View className="flex-1 justify-center items-center p-6">
					{/* Completion Card */}
					<View
						className="w-full max-w-xl rounded-3xl p-8 shadow-lg items-center"
						style={{ backgroundColor: scoreData.color }}
					>
						{/* Score Display */}
						<Text className="text-8xl mb-4">{scoreData.emoji}</Text>
						<Title className="text-center mb-2 text-black">
							{scoreData.message}
						</Title>
						<Text className="text-5xl font-bold text-black mb-4">
							{finalScore}%
						</Text>
						<Subtitle className="text-center text-black/80 mb-6">
							Quiz Complete!
						</Subtitle>

						{/* Next Steps Message */}
						<View className="bg-white/20 rounded-2xl p-4 mb-6 w-full">
							<Text className="text-center text-black font-medium">
								{nextMessage}
							</Text>
						</View>
					</View>

					{/* Card Progress Summary */}
					<View className="bg-primary/10 rounded-2xl p-6 mb-6 border-2 border-primary/20 w-full max-w-xl">
						<Caption className="text-center mb-4">{card.name} Card Complete!</Caption>
						<View className="gap-3">
							<View className="flex-row items-center justify-between">
								<Text>Educational Quiz</Text>
								<View className="flex-row items-center gap-2">
									<Text className="text-success font-semibold">Complete</Text>
									<Text>✓</Text>
								</View>
							</View>
							<View className="flex-row items-center justify-between">
								<Text>Guided Discovery</Text>
								<View className="flex-row items-center gap-2">
									<Text className="text-success font-semibold">Complete</Text>
									<Text>✓</Text>
								</View>
							</View>
							<View className="flex-row items-center justify-between">
								<Text>Purpose Statement Created</Text>
								<View className="flex-row items-center gap-2">
									<Text className="text-success font-semibold">Yes</Text>
									<Text>✓</Text>
								</View>
							</View>
						</View>
					</View>

					{/* Motivational Message */}
					<View className="bg-card rounded-2xl p-6 mb-6 shadow-lg border-2 border-border w-full max-w-xl">
						<Text className="text-center text-muted-foreground">
							🎯 Every question you answer builds your brand clarity. 
							Keep exploring to unlock deeper insights about your business!
						</Text>
					</View>

					{/* Action Buttons */}
					<View className="gap-4 w-full max-w-xl">
						<Button
							variant="white"
							size="lg"
							onPress={onContinue}
							className="w-full rounded-2xl"
						>
							<Text className="font-semibold text-lg">Continue Learning</Text>
						</Button>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
