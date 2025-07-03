import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { Title, Subtitle } from "@/components/ui/typography";
import { Button, TransparentIcon } from "@/components/ui/button";
import { Image } from "@/components/image";
import { useAuth } from "../../../context/supabase-provider";
import { getCard } from "../../../lib/database-helpers";
import { ProgressManager } from "../../../lib/progress-manager";
import { getCardImage } from "@/lib/card-images";
import { colors } from "@/constants/colors";
import {
	EducationalQuiz,
	GuidedDiscovery,
	QuizCompletionModal,
} from "../../../components/quiz";
import { showNativeCardMenu } from "../../../components/ui/native-card-menu";
import { Database } from "../../../lib/database.types";
import { registerTabResetCallback, unregisterTabResetCallback } from "./_layout";

// Types
type Card = Database["public"]["Tables"]["cards"]["Row"] & {
	card_sections: (Database["public"]["Tables"]["card_sections"]["Row"] & {
		questions: (Database["public"]["Tables"]["questions"]["Row"] & {
			answer_choices: (Database["public"]["Tables"]["answer_choices"]["Row"] & {
				icon: string | null;
			})[];
		})[];
	})[];
};

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

// View states
type ViewState = "home" | "educational" | "guided" | "completed";

interface QuizState {
	currentCard: Card | null;
	currentSection: string;
	educationalScore: number;
	viewState: ViewState;
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

	// Only render if we have a valid image source and no error
	if (!imageSource || imageError) {
		return null;
	}

	// Check if imageSource is a string (URL) or an object (SVG component)
	const isUrl = typeof imageSource === 'string';
	const isSvgComponent = imageSource && typeof imageSource === 'object' && 
		(imageSource.default || typeof imageSource === 'function');

	if (!isUrl && !isSvgComponent) {
		return null;
	}

	return (
		<View className="items-center mb-6">
			{isUrl ? (
				<Image
					source={{ uri: imageSource }}
					className="w-full h-48"
					contentFit="contain"
					onError={() => {
						setImageError(true);
					}}
					onLoad={() => {
						// Image loaded successfully
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
	onPress,
	onStartOver
}: { 
	card: CardWithProgress; 
	onPress: () => void;
	onStartOver: (cardId: string) => void;
}) => {
	const isCompleted = card.status === "completed";
	const isStarted = card.status === "in_progress";
	const isComingSoon = card.card_status === "coming_soon";
	const backgroundColor = card.color || colors.primary;

	const handleMenuPress = () => {
		showNativeCardMenu({
			cardName: card.name,
			onStartOver: () => onStartOver(card.id)
		});
	};

	// Calculate display progress - show 100% if card is completed
	const displayProgress = isCompleted ? 100 : (card.progress / card.total) * 100;

	return (
		<View className="mx-4 mb-6">
			<Pressable
				onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
					onPress();
				}}
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
					<TransparentIcon onPress={handleMenuPress} />
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
									width: `${displayProgress}%`,
								}}
							/>
						</View>
					</View>
				)}

				{/* Action button */}
				<Button
					onPress={isComingSoon ? undefined : () => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
						onPress();
					}}
					size="lg"
					variant="white"
					className="rounded-full py-4"
					disabled={isComingSoon}
				>
					<Text className="text-lg font-semibold">
						{isComingSoon 
							? "Coming Soon" 
							: isCompleted 
								? "Completed" 
								: (isStarted ? "Continue" : "Start Now")
						}
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
	const [loading, setLoading] = useState(false);
	
	// Quiz state
	const [quizState, setQuizState] = useState<QuizState>({
		currentCard: null,
		currentSection: "educational",
		educationalScore: 0,
		viewState: "home",
	});

	const loadCardsWithProgress = async (forceFresh: boolean = false) => {
		try {
			// Set loading to true at the start of the operation
			setLoading(true);
			
			const progressManager = new ProgressManager(session);
			console.log('ProgressManager created with session:', !!session, 'userId:', session?.user?.id);

			let cardsWithProgress: CardWithProgress[];
			
			if (forceFresh) {
				// Force fresh data retrieval - used when returning from quiz
				console.log('Loading fresh cards data...');
				cardsWithProgress = await progressManager.getAllCardsWithFreshData();
			} else {
				// Use the cached system for normal loads
				console.log('Loading cards with caching...');
				const { cards, fromCache } = await progressManager.getAllCardsWithCaching();
				console.log('Cards loaded:', cards.length, 'fromCache:', fromCache);
				cardsWithProgress = cards;
			}
			
			console.log('Final cards count:', cardsWithProgress.length);
			setCards(cardsWithProgress);
		} catch (error) {
			console.error('Error loading cards:', error);
		} finally {
			// Always set loading to false when operation completes, regardless of results
			setLoading(false);
		}
	};

	// Load full card data when starting quiz
	const loadFullCard = async (slug: string): Promise<Card | null> => {
		try {
			const { data: card, error } = await getCard(slug);
			if (error) {
				return null;
			}
			return card as Card;
		} catch (error) {
			return null;
		}
	};

	// Handle card press - start quiz flow
	const handleCardPress = async (card: CardWithProgress) => {
		if (card.card_status === "coming_soon") return;

		// Load full card data with sections and questions
		const fullCard = await loadFullCard(card.slug);
		if (!fullCard) {
			return;
		}

		// Determine starting section based on progress
		const progressManager = new ProgressManager(session);
		const progress = await progressManager.getCardProgress(card.id);
		
		let startingSection = "educational";
		let educationalScore = 0;
		
		if (progress.status === "completed") {
			startingSection = "completed";
		} else if (progress.progress > 0) {
			// If there's any progress, check if educational is completed
			// For now, we'll assume progress > 0 means educational is done
			if (progress.progress >= 1) {
				startingSection = "guided";
			}
		}

		// Try to get educational score from local/database storage
		// For now, we'll start with 0 and let the quiz flow handle it
		
		setQuizState({
			currentCard: fullCard,
			currentSection: startingSection,
			educationalScore,
			viewState: startingSection as ViewState,
		});
	};

	// Quiz event handlers
	const handleEducationalComplete = (score: number) => {
		setQuizState(prev => ({
			...prev,
			educationalScore: score,
			currentSection: "guided",
			viewState: "guided",
		}));
	};

	const handleGuidedComplete = () => {
		setQuizState(prev => ({
			...prev,
			currentSection: "completed",
			viewState: "completed",
		}));
	};

	const handleQuizExit = () => {
		setQuizState({
			currentCard: null,
			currentSection: "educational",
			educationalScore: 0,
			viewState: "home",
		});
		// Refresh cards with fresh data to update progress after quiz
		loadCardsWithProgress(true);
	};

	const handleCardComplete = () => {
		// Return to home and refresh
		handleQuizExit();
	};

	// Handle start over functionality
	const handleStartOver = async (cardId: string) => {
		try {
			const progressManager = new ProgressManager(session);
			await progressManager.resetCardProgress(cardId);
			
			// Refresh cards with fresh data to update progress after reset
			await loadCardsWithProgress(true);
		} catch (error) {
			// Handle error silently
		}
	};

	// Load data when component mounts
	useEffect(() => {
		loadCardsWithProgress();
	}, [session]);

	// Refresh data when screen comes into focus (user returns from card)
	useFocusEffect(
		useCallback(() => {
			if (quizState.viewState === "home") {
				loadCardsWithProgress();
			}
		}, [session, quizState.viewState]),
	);

	// Register tab reset callback
	useEffect(() => {
		const resetQuizState = () => {
			if (quizState.viewState !== "home") {
				setQuizState({
					currentCard: null,
					currentSection: "educational",
					educationalScore: 0,
					viewState: "home",
				});
			}
		};

		registerTabResetCallback(resetQuizState);

		return () => {
			unregisterTabResetCallback();
		};
	}, [quizState.viewState]);

	const educationalSection = quizState.currentCard?.card_sections.find(
		(s) => s.type === "educational",
	);
	const guidedSection = quizState.currentCard?.card_sections.find(
		(s) => s.type === "guided"
	);

	// Show all cards in order, with the first uncompleted card highlighted
	const sortedCards = cards.sort((a, b) => a.order_index - b.order_index);
	
	// Prioritize open cards over coming soon cards for the active card
	const activeCard = sortedCards.find(card => 
		card.status !== "completed" && card.card_status === "open"
	) || sortedCards.find(card => card.status !== "completed") || sortedCards[0];
	
	const otherCards = sortedCards.filter(card => card.id !== activeCard?.id);

	if (loading) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: "#1A1A1A" }}>
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg text-white">
						Loading cards...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
			{/* Header */}
			<View className="items-center pt-4 pb-6">
				<Pressable 
					onPress={() => {
						// Return to home when ClarityOS is tapped during a quiz
						if (quizState.viewState !== "home") {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							setQuizState({
								currentCard: null,
								currentSection: "educational",
								educationalScore: 0,
								viewState: "home",
							});
						}
					}}
					className="py-2 px-4 rounded-lg"
				>
					<Title className="text-brand-primary-vibrantGreen text-2xl font-medium">Mouse</Title>
				</Pressable>
			</View>

			{/* Main Content Area */}
			<View className="flex-1">
				{/* Quiz Views */}
				{quizState.viewState === "educational" && educationalSection && (
					<EducationalQuiz
						card={quizState.currentCard!}
						section={educationalSection}
						onComplete={handleEducationalComplete}
						onExit={handleQuizExit}
					/>
				)}

				{quizState.viewState === "guided" && guidedSection && (
					<GuidedDiscovery
						card={quizState.currentCard!}
						section={guidedSection}
						onComplete={handleGuidedComplete}
						onExit={handleQuizExit}
						educationalScore={quizState.educationalScore}
					/>
				)}

				{quizState.viewState === "completed" && (
					<View className="flex-1 items-center justify-center">
						<Text className="text-white text-xl">Card completed!</Text>
						<Button onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							handleCardComplete();
						}} className="mt-4">
							<Text>Back to Home</Text>
						</Button>
					</View>
				)}

				{/* Home View - Card List */}
				{quizState.viewState === "home" && (
					<ScrollView 
						className="flex-1" 
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 120 }} // Add padding for floating tab bar
					>
						{/* Featured Card */}
						{activeCard && (
							<Card
								card={activeCard}
								onPress={() => handleCardPress(activeCard)}
								onStartOver={handleStartOver}
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
									onPress={() => handleCardPress(card)}
									onStartOver={handleStartOver}
								/>
							);
						})}


					</ScrollView>
				)}
			</View>
		</SafeAreaView>
	);
}
