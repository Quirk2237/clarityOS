import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { ProgressCard } from "@/components/ui/progress";
import { StreakCounter } from "@/components/ui/streak-counter";
import { AchievementBadge } from "@/components/ui/achievement-badge";
import { useAuth } from "@/context/supabase-provider";
import { getAllCardsWithProgress, getUserAchievements } from "@/lib/database-helpers";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

interface CardWithProgress {
	id: string;
	name: string;
	slug: string;
	progress: number;
	total: number;
	status: string;
}

export default function Dashboard() {
	const { session } = useAuth();
	const [cards, setCards] = useState<CardWithProgress[]>([]);
	const [achievements, setAchievements] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const loadData = async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		try {
			// Load cards with progress
			const { data: cardsData, error: cardsError } = await getAllCardsWithProgress(session.user.id);
			if (cardsError) {
				console.error("Error loading cards:", cardsError);
			} else {
				setCards(cardsData);
			}

			// Load achievements
			const { data: achievementsData, error: achievementsError } = await getUserAchievements(session.user.id);
			if (achievementsError) {
				console.error("Error loading achievements:", achievementsError);
			} else {
				setAchievements(achievementsData || []);
			}
		} catch (error) {
			console.error("Error loading dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [session]);

	// Refresh data when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [session])
	);

	// Calculate overall progress
	const completedCards = cards.filter(card => card.status === "completed").length;
	const totalCards = cards.length;

	// Calculate streak (mock data for now - you can implement real streak logic)
	const currentStreak = 7; // This could come from a user_streaks table

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg">Loading your dashboard...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-6">
					{/* Header */}
					<View className="items-center mb-2">
						<H1 className="text-center text-foreground">Your Progress</H1>
						<Muted className="text-center">
							Track your brand clarity journey
						</Muted>
					</View>

					{/* Streak Counter */}
					<View className="items-center">
						<StreakCounter count={currentStreak} isActive={true} />
					</View>

					{/* Overall Progress */}
					<View className="bg-white dark:bg-duo-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-200 dark:border-duo-gray-700">
						<H2 className="text-gray-800 dark:text-duo-gray-100 mb-3">Overall Progress</H2>
						<ProgressCard
							title="Brand Cards Completed"
							progress={completedCards}
							total={totalCards}
							color="#58CC02"
						/>
					</View>

					{/* Individual Card Progress */}
					<View className="bg-white dark:bg-duo-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-200 dark:border-duo-gray-700">
						<H2 className="text-gray-800 dark:text-duo-gray-100 mb-4">Card Progress</H2>
						<View className="gap-3">
							{cards.map((card) => {
								let color = "#E8EAED"; // Gray for not started
								if (card.status === "completed") {
									color = "#58CC02"; // Green for completed
								} else if (card.status === "in_progress") {
									color = "#FFD900"; // Yellow for in progress
								}

								return (
									<ProgressCard
										key={card.id}
										title={card.name}
										progress={card.progress}
										total={card.total}
										color={color}
									/>
								);
							})}
						</View>
					</View>

					{/* Achievements */}
					<View className="bg-white dark:bg-duo-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-200 dark:border-duo-gray-700">
						<H2 className="text-gray-800 dark:text-duo-gray-100 mb-4">Achievements</H2>
						<View className="flex-row justify-around">
							<AchievementBadge
								icon="🎯"
								title="Purpose Master"
								unlocked={cards.find(c => c.slug === "purpose")?.status === "completed"}
							/>
							<AchievementBadge
								icon="📍"
								title="Positioning Pro"
								unlocked={cards.find(c => c.slug === "positioning")?.status === "completed"}
							/>
							<AchievementBadge
								icon="✨"
								title="Clarity Champion"
								unlocked={completedCards >= 5}
							/>
							<AchievementBadge
								icon="🏆"
								title="Brand Master"
								unlocked={completedCards === totalCards}
							/>
						</View>
					</View>

					{/* Weekly Goal */}
					<View className="bg-white dark:bg-duo-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-200 dark:border-duo-gray-700">
						<H2 className="text-gray-800 dark:text-duo-gray-100 mb-4">This Week's Goal</H2>
						<ProgressCard
							title="Complete 3 brand sections"
							progress={Math.min(3, cards.reduce((sum, card) => sum + card.progress, 0))}
							total={3}
							color="#FFD900"
						/>
						<Text className="text-gray-600 dark:text-duo-gray-400 text-sm mt-2">
							{cards.reduce((sum, card) => sum + card.progress, 0) >= 3
								? "🎉 Week goal completed! Keep up the great work!"
								: "You're making great progress toward your weekly goal!"
							}
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
