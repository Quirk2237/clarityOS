import { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/supabase-provider";
import { getAllCardsWithProgress } from "@/lib/database-helpers";
import { useCallback } from "react";

// Brand Card Component
interface BrandCardProps {
	title: string;
	icon: string;
	progress: number;
	total: number;
	onPress: () => void;
	locked?: boolean;
	slug?: string;
	status?: string;
}

interface CardWithProgress {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	order_index: number;
	progress: number;
	total: number;
	status: string;
}

const BrandCard = ({
	title,
	icon,
	progress,
	total,
	onPress,
	locked = false,
	status = "not_started",
}: BrandCardProps) => {
	const isCompleted = status === "completed";
	const isStarted = status === "in_progress";

	return (
		<Pressable
			onPress={locked ? undefined : onPress}
			className={`
				bg-white dark:bg-duo-gray-800 rounded-2xl p-5 shadow-lg border-2 
				border-gray-200 dark:border-duo-gray-700 mb-4
				${locked ? "opacity-50" : "active:scale-98"}
			`}
			style={{
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
				elevation: 3,
			}}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center flex-1">
					<View
						className={`
						w-16 h-16 rounded-full items-center justify-center mr-4 border-3 border-white dark:border-duo-gray-800
						${isCompleted ? "bg-duo-primary" : isStarted ? "bg-duo-warning" : "bg-gray-200 dark:bg-duo-gray-600"}
					`}
					>
						<Text className="text-2xl">{locked ? "🔒" : icon}</Text>
					</View>

					<View className="flex-1">
						<H2 className="text-gray-800 dark:text-duo-gray-100 mb-1">
							{title}
						</H2>
						<View className="bg-gray-200 dark:bg-duo-gray-700 h-2 rounded-full overflow-hidden mb-1">
							<View
								className={`h-full rounded-full ${isCompleted ? "bg-duo-primary" : "bg-duo-warning"}`}
								style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
							/>
						</View>
						<Text className="text-xs text-gray-600 dark:text-duo-gray-400">
							{locked
								? "Complete previous cards to unlock"
								: `${progress}/${total} complete`}
						</Text>
					</View>
				</View>

				{!locked && (
					<Button
						variant="outline"
						size="sm"
						onPress={onPress}
						className="ml-2"
					>
						<Text>{isStarted || isCompleted ? "Continue" : "Start"}</Text>
					</Button>
				)}
			</View>
		</Pressable>
	);
};

export default function Home() {
	const router = useRouter();
	const { session } = useAuth();
	const [cards, setCards] = useState<CardWithProgress[]>([]);
	const [loading, setLoading] = useState(true);

	const loadCardsWithProgress = async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		try {
			const { data, error } = await getAllCardsWithProgress(session.user.id);
			if (error) {
				console.error("Error loading cards with progress:", error);
			} else {
				setCards(data);
			}
		} catch (error) {
			console.error("Error loading cards with progress:", error);
		} finally {
			setLoading(false);
		}
	};

	// Load data when component mounts
	useEffect(() => {
		loadCardsWithProgress();
	}, [session]);

	// Refresh data when screen comes into focus (user returns from card)
	useFocusEffect(
		useCallback(() => {
			loadCardsWithProgress();
		}, [session])
	);

	// Calculate overall progress
	const totalPossibleProgress = cards.reduce((sum, card) => sum + card.total, 0);
	const totalCurrentProgress = cards.reduce((sum, card) => sum + card.progress, 0);
	const overallProgressPercentage = totalPossibleProgress > 0 
		? (totalCurrentProgress / totalPossibleProgress) * 100 
		: 0;

	// Determine which cards should be locked
	const cardsWithLockStatus = cards.map((card, index) => {
		// First card is never locked
		if (index === 0) return { ...card, locked: false };
		
		// Check if previous card is completed
		const previousCard = cards[index - 1];
		const isLocked = previousCard.status !== "completed";
		
		return { ...card, locked: isLocked };
	});

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg">Loading your progress...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4">
					{/* Header */}
					<View className="items-center mb-6">
						<H1 className="text-center text-foreground">
							Brand Clarity Journey
						</H1>
						<Muted className="text-center">
							Master the 7 pillars of brand strategy
						</Muted>
					</View>

					{/* Progress Overview */}
					<View className="bg-white dark:bg-duo-gray-800 rounded-2xl p-5 shadow-lg border-2 border-gray-200 dark:border-duo-gray-700 mb-6">
						<View className="flex-row items-center justify-between mb-3">
							<H2 className="text-gray-800 dark:text-duo-gray-100">
								Your Progress
							</H2>
							<Text className="text-duo-primary dark:text-duo-primary-400 font-bold text-lg">
								{totalCurrentProgress}/{totalPossibleProgress}
							</Text>
						</View>
						<View className="bg-gray-200 dark:bg-duo-gray-700 h-3 rounded-full overflow-hidden">
							<View
								className="bg-duo-primary h-full rounded-full"
								style={{ width: `${overallProgressPercentage}%` }}
							/>
						</View>
						<Text className="text-gray-600 dark:text-duo-gray-400 text-sm mt-2">
							{totalCurrentProgress === 0 
								? "Start your brand clarity journey! Begin with Purpose."
								: totalCurrentProgress === totalPossibleProgress
								? "Congratulations! You've completed your brand clarity journey!"
								: "Keep going! You're making great progress on your brand clarity."
							}
						</Text>
					</View>

					{/* Brand Cards */}
					<View>
						{cardsWithLockStatus.map((card) => {
							// Map database icons to emoji icons
							const iconMap: { [key: string]: string } = {
								purpose: "🎯",
								positioning: "📍", 
								personality: "✨",
								"product-market-fit": "🎪",
								perception: "👁️",
								presentation: "🎨",
								proof: "🏆",
							};

							return (
								<BrandCard
									key={card.id}
									title={card.name}
									icon={iconMap[card.slug] || "📋"}
									progress={card.progress}
									total={card.total}
									locked={card.locked}
									status={card.status}
									slug={card.slug}
									onPress={() => router.push(`/(protected)/cards/${card.slug}` as any)}
								/>
							);
						})}
					</View>

					{/* Motivational Footer */}
					<View className="bg-duo-primary/10 dark:bg-duo-primary/20 rounded-2xl p-5 mt-4 mb-8">
						<Text className="text-center text-duo-primary dark:text-duo-primary-400 font-semibold text-lg mb-2">
							🌟 You&apos;re doing great!
						</Text>
						<Text className="text-center text-gray-700 dark:text-duo-gray-300">
							Every step brings you closer to complete brand clarity.
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
