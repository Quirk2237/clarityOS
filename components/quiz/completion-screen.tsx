import { View, ScrollView } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Title, Subtitle, Caption } from "../ui/typography";
import { Button } from "@/components/ui/button";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import { Progress } from "@/components/ui/progress";
import { Database } from "../../lib/database.types";

type Card = Database["public"]["Tables"]["cards"]["Row"];
type Achievement = Database["public"]["Tables"]["achievements"]["Row"];

interface CompletionScreenProps {
	card: Card;
	finalScore: number;
	achievements: Achievement[];
	onContinue: () => void;
}

export function CompletionScreen({
	card,
	finalScore,
	achievements,
	onContinue,
}: CompletionScreenProps) {
	const getScoreMessage = (score: number) => {
		if (score >= 95)
			return { emoji: "🏆", message: "Perfect!", color: "#FFD700" };
		if (score >= 85)
			return { emoji: "🌟", message: "Excellent!", color: "#ACFF64" };
		if (score >= 75)
			return { emoji: "🎯", message: "Great job!", color: "#1CB0F6" };
		if (score >= 65)
			return { emoji: "👍", message: "Well done!", color: "#FFD900" };
		return { emoji: "💪", message: "Keep learning!", color: "#FF9500" };
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
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="flex-1 p-6">
					{/* Header Animation */}
					<View className="items-center mb-8 pt-8">
						<Text className="text-8xl mb-4">{scoreData.emoji}</Text>
						<Title className="text-center mb-2" style={{ color: scoreData.color }}>
							{scoreData.message}
						</Title>
						<Subtitle className="text-center text-muted-foreground">
							You unlocked {card.name} Mastery!
						</Subtitle>
					</View>

					{/* Score Display */}
					<View className="bg-card rounded-2xl p-6 mb-6 shadow-lg border-2 border-border">
						<View className="items-center mb-4">
							<Caption className="text-center mb-2">Your Score</Caption>
							<View className="items-center">
								<Text
									className="text-6xl font-bold mb-2"
									style={{ color: scoreData.color }}
								>
									{finalScore}
								</Text>
								<Text className="text-lg text-muted-foreground">
									out of 100
								</Text>
							</View>
						</View>

						<Progress
							value={finalScore}
							max={100}
							showLabel={false}
							className="h-4"
							variant="success"
						/>

						<View className="mt-4 gap-2">
							<View className="flex-row justify-between">
								<Text className="text-sm text-muted-foreground">
									Knowledge gained
								</Text>
								<Text className="text-sm font-medium">+100%</Text>
							</View>
							<View className="flex-row justify-between">
								<Text className="text-sm text-muted-foreground">
									Clarity increased
								</Text>
								<Text className="text-sm font-medium">Significantly</Text>
							</View>
							<View className="flex-row justify-between">
								<Text className="text-sm text-muted-foreground">
									Confidence boost
								</Text>
								<Text className="text-sm font-medium">Major</Text>
							</View>
						</View>
					</View>

					{/* Achievements */}
					{achievements.length > 0 && (
						<View className="bg-card rounded-2xl p-6 mb-6 shadow-lg border-2 border-border">
							<Caption className="text-center mb-4">🏆 New Achievements</Caption>
							<View className="flex-row justify-center gap-4 flex-wrap">
								{achievements.map((achievement, index) => (
									<AchievementBadge
										id={achievement.id}
										key={achievement.id}
										icon={getAchievementIcon(achievement.achievement_type)}
										title={getAchievementTitle(achievement.achievement_type)}
										description={getAchievementDescription(
											achievement.achievement_type,
										)}
										unlocked={true}
										size="lg"
									/>
								))}
							</View>
						</View>
					)}

					{/* Card Progress Summary */}
					<View className="bg-primary/10 rounded-2xl p-6 mb-6 border-2 border-primary/20">
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
					<View className="bg-success/10 rounded-2xl p-6 mb-8 border-2 border-success/20">
						<Text className="text-center text-lg font-semibold mb-2">
							🌟 Amazing Progress!
						</Text>
						<Text className="text-center text-muted-foreground mb-4">
							You&apos;ve taken a huge step toward brand clarity. Your{" "}
							{card.name.toLowerCase()} is now crystal clear, giving you the
							foundation for confident business decisions.
						</Text>
						<Text
							className="text-center font-medium"
							style={{ color: scoreData.color }}
						>
							{nextMessage}
						</Text>
					</View>

					{/* Action Buttons */}
					<View className="gap-3 mb-6">
						<Button
							variant="default"
							size="lg"
							onPress={onContinue}
							className="shadow-lg"
						>
							<Text className="font-semibold text-lg">
								Continue Learning Journey
							</Text>
						</Button>

						<Button
							variant="secondary"
							size="lg"
							onPress={() => {
								// Could add sharing functionality here
								console.log("Share results");
							}}
						>
							<Text>Share Your Achievement 📱</Text>
						</Button>
					</View>

					{/* Fun Facts */}
					<View className="bg-muted/50 rounded-2xl p-6 border border-border">
						<Caption className="text-center mb-4">💡 Did You Know?</Caption>
						<Text className="text-center text-muted-foreground">
							Brands with a clear purpose grow 2.5x faster than those without.
							You&apos;re now ahead of 85% of businesses that struggle with
							brand clarity!
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

// Helper functions for achievements
function getAchievementIcon(type: Achievement["achievement_type"]): string {
	switch (type) {
		case "perfect_score":
			return "💎";
		case "fast_learner":
			return "⚡";
		case "card_completed":
			return "🎯";
		case "streak":
			return "🔥";
		default:
			return "🏆";
	}
}

function getAchievementTitle(type: Achievement["achievement_type"]): string {
	switch (type) {
		case "perfect_score":
			return "Perfectionist";
		case "fast_learner":
			return "Quick Learner";
		case "card_completed":
			return "Card Master";
		case "streak":
			return "On Fire";
		default:
			return "Achievement";
	}
}

function getAchievementDescription(
	type: Achievement["achievement_type"],
): string {
	switch (type) {
		case "perfect_score":
			return "Perfect score achieved";
		case "fast_learner":
			return "Completed with speed";
		case "card_completed":
			return "Card completed";
		case "streak":
			return "Learning streak";
		default:
			return "Achievement unlocked";
	}
}
