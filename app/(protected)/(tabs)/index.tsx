import { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { H1, H2 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/image";
import { useAuth } from "@/context/supabase-provider";
import { getAllCardsWithProgress, getActiveCards } from "@/lib/database-helpers";
import { getCardImage } from "@/lib/card-images";

interface CardWithProgress {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	order_index: number;
	image_url: string | null;
	progress: number;
	total: number;
	status: string;
}

// Featured Card Component for the main card display
const FeaturedCard = ({ 
	card, 
	onPress 
}: { 
	card: CardWithProgress; 
	onPress: () => void 
}) => {
	const [imageError, setImageError] = useState(false);
	const isCompleted = card.status === "completed";
	const isStarted = card.status === "in_progress";

	return (
		<View className="mx-4 mb-6">
			<Pressable
				onPress={onPress}
				className="bg-[#ACFF64] rounded-3xl p-6 shadow-lg active:scale-98"
				style={{
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.15,
					shadowRadius: 12,
					elevation: 8,
					minHeight: 420,
				}}
			>
				{/* Menu dots */}
				<View className="flex-row justify-end mb-4">
					<View className="bg-white/20 rounded-full p-2">
						<Text className="text-white text-lg font-bold">⋯</Text>
					</View>
				</View>

				{/* Image/Illustration area */}
				<View className="flex-1 items-center justify-center mb-6">
					{getCardImage(card.image_url, card.slug) && !imageError ? (
						<Image
							source={getCardImage(card.image_url, card.slug)}
							className="w-full h-48 rounded-2xl"
							contentFit="cover"
							onError={() => {
								setImageError(true);
								console.log(`Failed to load image for card: ${card.name}`);
							}}
						/>
					) : (
						<View className="relative w-full h-48 items-center justify-center">
							{/* Fallback illustration for cards without images */}
							<View className="absolute top-4 left-8 w-16 h-16 bg-white/30 rounded-full" />
							<View className="absolute top-8 right-12 w-8 h-8 bg-yellow-400 rounded-lg transform rotate-45" />
							
							{/* Main illustration elements */}
							<View className="absolute top-12 left-1/2 transform -translate-x-1/2">
								<View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-gray-800">
									<View className="w-12 h-12 bg-yellow-400 rounded-full items-center justify-center">
										<Text className="text-xl">🎯</Text>
									</View>
								</View>
							</View>

							{/* Character figure */}
							<View className="absolute top-20 right-8">
								<View className="w-16 h-20 bg-yellow-400 rounded-t-full items-center justify-end pb-2">
									<Text className="text-2xl">👤</Text>
								</View>
							</View>

							{/* Additional elements */}
							<View className="absolute bottom-8 left-4 w-6 h-6 bg-gray-800 rounded-sm" />
							<View className="absolute bottom-4 right-4">
								<View className="w-10 h-8 bg-green-600 rounded-sm flex-row">
									<View className="w-3 h-8 bg-green-700" />
								</View>
							</View>

							{/* Geometric shapes */}
							<View className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
								<View className="w-8 h-8 bg-yellow-400 transform rotate-45" />
							</View>
						</View>
					)}
				</View>

				{/* Card content */}
				<View className="mb-6">
					<H1 className="text-gray-800 text-3xl font-bold mb-3">
						{card.name}
					</H1>
					<Text className="text-gray-700 text-lg leading-relaxed">
						{card.description || "Discover why your brand exists and what makes it special."}
					</Text>
				</View>

				{/* Progress indicator */}
				{card.total > 0 && (
					<View className="mb-6">
						<View className="bg-white/30 h-2 rounded-full overflow-hidden">
							<View
								className="h-full bg-white rounded-full"
								style={{
									width: `${(card.progress / card.total) * 100}%`,
								}}
							/>
						</View>
					</View>
				)}

				{/* Action button */}
				<Button
					onPress={onPress}
					size="lg"
					className="bg-white rounded-2xl py-4 shadow-md"
				>
					<Text className="text-gray-800 text-lg font-semibold">
						{isStarted || isCompleted ? "Continue" : "Start Now"}
					</Text>
				</Button>
			</Pressable>
		</View>
	);
};

// Preview Card Component for secondary cards
const PreviewCard = ({ 
	card, 
	onPress,
	backgroundColor = "#E879F9"
}: { 
	card: CardWithProgress; 
	onPress: () => void;
	backgroundColor?: string;
}) => {
	const [imageError, setImageError] = useState(false);
	return (
		<View className="mx-4 mb-4">
			<Pressable
				onPress={onPress}
				className="rounded-3xl p-6 shadow-lg active:scale-98"
				style={{
					backgroundColor,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.15,
					shadowRadius: 12,
					elevation: 8,
					height: 120,
				}}
			>
				{/* Menu dots */}
				<View className="flex-row justify-end mb-2">
					<View className="bg-white/20 rounded-full p-1">
						<Text className="text-white text-sm font-bold">⋯</Text>
					</View>
				</View>

				{/* Preview content */}
				<View className="flex-row items-center">
					<View className="flex-1">
						<Text className="text-white text-lg font-bold mb-1">
							{card.name}
						</Text>
						<Text className="text-white/80 text-sm">
							{card.progress}/{card.total} complete
						</Text>
					</View>
					
					{/* Card image or fallback icon */}
					{getCardImage(card.image_url, card.slug) && !imageError ? (
						<Image
							source={getCardImage(card.image_url, card.slug)}
							className="w-12 h-12 rounded-full"
							contentFit="cover"
							onError={() => {
								setImageError(true);
								console.log(`Failed to load preview image for card: ${card.name}`);
							}}
						/>
					) : (
						<View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
							<Text className="text-xl">💡</Text>
						</View>
					)}
				</View>
			</Pressable>
		</View>
	);
};

export default function Home() {
	const router = useRouter();
	const { session } = useAuth();
	const [cards, setCards] = useState<CardWithProgress[]>([]);
	const [loading, setLoading] = useState(true);

	const loadCardsWithProgress = async () => {
		setLoading(true);
		try {
			if (session?.user?.id) {
				// Authenticated user - load cards with progress
				const { data, error } = await getAllCardsWithProgress(session.user.id);
				if (error) {
					console.error("Error loading cards with progress:", error);
				} else {
					setCards(data);
				}
			} else {
				// Non-authenticated user - load cards without progress
				const { data, error } = await getActiveCards();
				if (error) {
					console.error("Error loading cards:", error);
				} else if (data) {
					// Transform data to match expected structure with default progress
					const cardsWithDefaultProgress = data.map((card) => ({
						id: card.id,
						name: card.name,
						slug: card.slug,
						description: card.description,
						order_index: card.order_index,
						image_url: card.image_url,
						progress: 0,
						total: card.card_sections?.length || 0,
						status: "not_started" as const,
					}));
					setCards(cardsWithDefaultProgress);
				}
			}
		} catch (error) {
			console.error("Error loading cards:", error);
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
		}, [session]),
	);

	// Find the current active card (first uncompleted card)
	const activeCard = cards.find(card => card.status !== "completed") || cards[0];
	const otherCards = cards.filter(card => card.id !== activeCard?.id);

	if (loading) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: "#292929" }}>
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg text-white">
						Loading your progress...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: "#292929" }}>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View className="items-center pt-4 pb-6">
					<H1 className="text-[#ACFF64] text-2xl font-bold">ClarityOS</H1>
				</View>

				{/* Featured Card */}
				{activeCard && (
					<FeaturedCard
						card={activeCard}
						onPress={() => router.push(`/cards/${activeCard.slug}`)}
					/>
				)}

				{/* Show message if no cards loaded */}
				{!loading && cards.length === 0 && (
					<View className="items-center justify-center py-8">
						<Text className="text-white text-lg">No cards available</Text>
					</View>
				)}

				{/* Preview Cards */}
				{otherCards.slice(0, 2).map((card, index) => {
					const colors = ["#E879F9", "#3B82F6", "#EF4444", "#10B981"];
					return (
						<PreviewCard
							key={card.id}
							card={card}
							backgroundColor={colors[index % colors.length]}
							onPress={() => router.push(`/cards/${card.slug}`)}
						/>
					);
				})}

				{/* Spacing for bottom navigation */}
				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
