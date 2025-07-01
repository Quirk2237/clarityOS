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
import { colors } from "@/constants/colors";

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
	card_status?: "open" | "coming_soon";
}

// Card Cover Component
const CardCover = ({ 
	imageUrl, 
	slug, 
	cardName 
}: { 
	imageUrl: string | null; 
	slug: string; 
	cardName: string;
}) => {
	const [imageError, setImageError] = useState(false);
	const imageSource = getCardImage(imageUrl, slug);

	// Reset error state when image source changes
	useEffect(() => {
		setImageError(false);
	}, [imageSource]);

	// Debug logging to see what we're getting
	useEffect(() => {
		console.log(`Card: ${cardName}, imageUrl: ${imageUrl}, slug: ${slug}`);
		console.log(`imageSource:`, imageSource);
		console.log(`imageSource type:`, typeof imageSource);
		if (imageSource && typeof imageSource === 'object') {
			console.log(`imageSource keys:`, Object.keys(imageSource));
		}
	}, [imageSource, cardName, imageUrl, slug]);

	// Only render if we have a valid image source and no error
	if (!imageSource || imageError) {
		console.log(`Not rendering image for ${cardName}: imageSource=${!!imageSource}, imageError=${imageError}`);
		return null;
	}

	// Check if imageSource is a string (URL) or an object (SVG component)
	const isUrl = typeof imageSource === 'string';
	const isSvgComponent = imageSource && typeof imageSource === 'object' && 
		(imageSource.default || typeof imageSource === 'function');

	console.log(`Card ${cardName}: isUrl=${isUrl}, isSvgComponent=${isSvgComponent}`);

	if (!isUrl && !isSvgComponent) {
		console.log(`No valid image format for ${cardName}`);
		return null;
	}

	return (
		<View className="items-center mb-6">
			{isUrl ? (
				<Image
					source={{ uri: imageSource }}
					className="w-full h-48"
					contentFit="contain"
					onError={(error) => {
						setImageError(true);
						console.log(`Failed to load image for card: ${cardName}`, error);
					}}
					onLoad={() => {
						console.log(`Successfully loaded image for card: ${cardName}`);
					}}
				/>
			) : isSvgComponent ? (
				<View className="w-full h-48 items-center justify-center">
					{imageSource.default ? 
						React.createElement(imageSource.default, {
							width: '100%',
							height: '100%',
							style: { maxWidth: 300, maxHeight: 192 }
						}) :
						React.createElement(imageSource, {
							width: '100%',
							height: '100%',
							style: { maxWidth: 300, maxHeight: 192 }
						})
					}
				</View>
			) : null}
		</View>
	);
};

// Unified Card Component for all cards
const Card = ({ 
	card, 
	onPress
}: { 
	card: CardWithProgress; 
	onPress: () => void;
}) => {
	const isCompleted = card.status === "completed";
	const isStarted = card.status === "in_progress";
	const isComingSoon = card.card_status === "coming_soon";
	const backgroundColor = card.color || colors.primary;

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
				}}
			>
				{/* Menu dots */}
				<View className="flex-row justify-end mb-4">
					<View className="bg-white/20 rounded-full p-2">
						<Text className="text-white text-lg font-bold">⋯</Text>
					</View>
				</View>

				{/* Card Cover - only shows when image is available */}
				<CardCover 
					imageUrl={card.image_url} 
					slug={card.slug} 
					cardName={card.name}
				/>

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
					onPress={isComingSoon ? undefined : onPress}
					size="lg"
					variant="white"
					className="rounded-full py-4"
					disabled={isComingSoon}
				>
					<Text className="text-lg font-semibold">
						{isComingSoon ? "Coming Soon" : (isStarted || isCompleted ? "Continue" : "Start Now")}
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
						card_status: card.status,
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
	
	// Prioritize open cards over coming soon cards for the active card
	const activeCard = sortedCards.find(card => 
		card.status !== "completed" && card.card_status === "open"
	) || sortedCards.find(card => card.status !== "completed") || sortedCards[0];
	
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
						onPress={() => {
							if (activeCard.card_status !== "coming_soon") {
								router.push(`../cards/${activeCard.slug}`);
							}
						}}
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
							onPress={() => {
								if (card.card_status !== "coming_soon") {
									router.push(`../cards/${card.slug}`);
								}
							}}
						/>
					);
				})}

				{/* Spacing for bottom navigation */}
				<View className="h-8" />
			</ScrollView>
		</SafeAreaView>
	);
}
