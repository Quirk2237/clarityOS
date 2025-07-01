import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { Title, Subtitle } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/image";
import { useAuth } from "../../../context/supabase-provider";
import { getAllCardsWithProgress, getActiveCards } from "../../../lib/database-helpers";
import { getCardImage } from "@/lib/card-images";

interface CardWithProgress {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	order_index: number;
	image_url: string | null;
	color: string | null;
	progress: number;
	total: number;
	status: string;
}

// Unified Card Component for all cards
const Card = ({ 
	card, 
	onPress
}: { 
	card: CardWithProgress; 
	onPress: () => void;
}) => {
	const [imageError, setImageError] = useState(false);
	const isCompleted = card.status === "completed";
	const isStarted = card.status === "in_progress";
	const backgroundColor = card.color || "#ACFF64";

	return (
		<View className="mx-4 mb-6">
			<Pressable
				onPress={onPress}
				className="rounded-large p-6 shadow-lg active:scale-98"
				style={{
					backgroundColor,
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
							className="w-full h-48 rounded-large"
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
							<View className="absolute top-8 right-12 w-8 h-8 bg-brand-accent-yellow rounded-medium transform rotate-45" />
							
							{/* Main illustration elements */}
							<View className="absolute top-12 left-1/2 transform -translate-x-1/2">
								<View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-brand-neutrals-textPrimary">
									<View className="w-12 h-12 bg-brand-accent-yellow rounded-full items-center justify-center">
										<Text className="text-xl">🎯</Text>
									</View>
								</View>
							</View>

							{/* Character figure */}
							<View className="absolute top-20 right-8">
								<View className="w-16 h-20 bg-brand-accent-yellow rounded-t-full items-center justify-end pb-2">
									<Text className="text-2xl">👤</Text>
								</View>
							</View>

							{/* Additional elements */}
							<View className="absolute bottom-8 left-4 w-6 h-6 bg-brand-neutrals-textPrimary rounded-small" />
							<View className="absolute bottom-4 right-4">
								<View className="w-10 h-8 bg-brand-primary-neonGreen rounded-small flex-row">
									<View className="w-3 h-8 bg-brand-primary-vibrantGreen" />
								</View>
							</View>

							{/* Geometric shapes */}
							<View className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
								<View className="w-8 h-8 bg-brand-accent-yellow transform rotate-45" />
							</View>
						</View>
					)}
				</View>

				{/* Card content */}
				<View className="mb-6">
					<Title className="text-brand-neutrals-textPrimary text-3xl font-bold mb-3">
						{card.name}
					</Title>
					<Text className="text-brand-neutrals-textPrimary text-lg leading-relaxed">
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
					variant="action"
					className="rounded-full py-4 shadow-md"
				>
					<Text className="text-brand-neutrals-textPrimary text-lg font-semibold">
						{isStarted || isCompleted ? "Continue" : "Start Now"}
					</Text>
				</Button>
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
					console.log("Loaded cards with progress:", data?.length, "cards");
					setCards(data);
				}
			} else {
				// Non-authenticated user - load cards without progress
				const { data, error } = await getActiveCards();
				if (error) {
					console.error("Error loading cards:", error);
				} else if (data) {
					console.log("Loaded active cards:", data.length, "cards");
					// Transform data to match expected structure with default progress
					const cardsWithDefaultProgress = data.map((card) => ({
						id: card.id,
						name: card.name,
						slug: card.slug,
						description: card.description,
						order_index: card.order_index,
						image_url: card.image_url,
						color: card.color,
						progress: 0,
						total: card.card_sections?.length || 0,
						status: "not_started" as const,
					}));
					console.log("Transformed cards:", cardsWithDefaultProgress.length, "cards");
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

	// Show all cards in order, with the first uncompleted card highlighted
	const sortedCards = cards.sort((a, b) => a.order_index - b.order_index);
	const activeCard = sortedCards.find(card => card.status !== "completed") || sortedCards[0];
	const otherCards = sortedCards.filter(card => card.id !== activeCard?.id);
	
	console.log("Total cards:", cards.length);
	console.log("Sorted cards:", sortedCards.length);
	console.log("Active card:", activeCard?.name);
	console.log("Other cards:", otherCards.length, otherCards.map(c => c.name));

	if (loading) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: "#1A1A1A" }}>
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg text-white">
						Loading your progress...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: "#1A1A1A" }}>
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View className="items-center pt-4 pb-6">
					<Title className="text-brand-primary-vibrantGreen text-2xl font-bold">ClarityOS</Title>
				</View>

				{/* Featured Card */}
				{activeCard && (
					<Card
						card={activeCard}
						onPress={() => router.push(`./cards/${activeCard.slug}`)}
					/>
				)}

				{/* Show message if no cards loaded */}
				{!loading && cards.length === 0 && (
					<View className="items-center justify-center py-8">
						<Text className="text-white text-lg">No cards available</Text>
					</View>
				)}

				{/* All Other Cards */}
				{otherCards.map((card, index) => {
					return (
						<Card
							key={card.id}
							card={card}
							onPress={() => router.push(`./cards/${card.slug}`)}
						/>
					);
				})}

				{/* Spacing for bottom navigation */}
				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
