import * as React from "react";
import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "../../../../components/safe-area-view";
import { Text } from "../../../../components/ui/text";
import { useAuth } from "../../../../context/supabase-provider";
import { getCard, getUserProgress } from "../../../../lib/database-helpers";
import {
	EducationalQuiz,
	GuidedDiscovery,
	QuizCompletionModal,
} from "../../../../components/quiz";
import { Database } from "../../../../lib/database.types";

type Card = Database["public"]["Tables"]["cards"]["Row"] & {
	card_sections: (Database["public"]["Tables"]["card_sections"]["Row"] & {
		questions: (Database["public"]["Tables"]["questions"]["Row"] & {
			answer_choices: Database["public"]["Tables"]["answer_choices"]["Row"][];
		})[];
	})[];
};

type Section = "educational" | "guided" | "completed";

export default function CardScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const router = useRouter();
	const { session } = useAuth();
	const [card, setCard] = useState<Card | null>(null);
	const [currentSection, setCurrentSection] = useState<Section>("educational");
	const [educationalScore, setEducationalScore] = useState<number>(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		console.log("useEffect triggered:", { slug, hasSession: !!session });
		if (slug) {
			console.log("Starting to load card and progress");
			loadCardAndProgress();
		} else {
			console.log("Missing slug");
		}
	}, [slug, session]);

	const loadCardAndProgress = async () => {
		try {
			console.log("Loading card with slug:", slug);
			// Load card data
			const { data: cardData, error: cardError } = await getCard(slug);
			console.log("Card data response:", { cardData, cardError });
			
			if (cardError) {
				console.error("Card error:", cardError);
				throw cardError;
			}

			if (!cardData) {
				console.error("No card data found for slug:", slug);
				throw new Error("Card not found");
			}

			console.log("Card loaded successfully:", cardData.name);
			setCard(cardData);

			// Load user progress for this card (only if session exists)
			if (!session?.user?.id) {
				console.log("No session, starting with educational section");
				setCurrentSection("educational");
				setLoading(false);
				return;
			}

			const { data: progressData, error: progressError } =
				await getUserProgress(session.user.id, cardData.id);

			if (progressError) {
				console.error("Error loading progress:", progressError);
			}

			// Determine which section to start with based on progress
			const educationalSection = cardData.card_sections.find(
				(s: Database["public"]["Tables"]["card_sections"]["Row"]) =>
					s.type === "educational",
			);
			const guidedSection = cardData.card_sections.find(
				(s: Database["public"]["Tables"]["card_sections"]["Row"]) =>
					s.type === "guided",
			);

			let startingSection: Section = "educational";

			if (progressData && progressData.length > 0) {
				// Check if educational section is completed
				const educationalCompleted = progressData.some(
					(p) =>
						p.section_id === educationalSection?.id && p.status === "completed",
				);

				// Check if guided section is completed
				const guidedCompleted = progressData.some(
					(p) => p.section_id === guidedSection?.id && p.status === "completed",
				);

				if (educationalCompleted && guidedCompleted) {
					startingSection = "completed";
				} else if (educationalCompleted) {
					startingSection = "guided";
				} else {
					startingSection = "educational";
				}

				// Set educational score if available (for completion screen)
				const educationalProgress = progressData.find(
					(p) => p.section_id === educationalSection?.id,
				);
				if (educationalProgress?.score) {
					setEducationalScore(educationalProgress.score);
				}
			}

			setCurrentSection(startingSection);

			console.log("Starting with section:", startingSection);
		} catch (error) {
			console.error("Error loading card and progress:", error);
			Alert.alert("Error", "Failed to load card content");
		} finally {
			setLoading(false);
		}
	};

	const handleEducationalComplete = (score: number) => {
		setEducationalScore(score);
		setCurrentSection("guided");
	};

	const handleGuidedComplete = () => {
		setCurrentSection("completed");
	};

	const handleExit = () => {
		router.replace('/');
	};

	const handleCardComplete = () => {
		router.push("/(protected)/(tabs)/" as any);
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-brand-neutrals-darkBackground">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg text-white">Loading card...</Text>
					<Text className="text-sm text-gray-400 mt-2">Slug: {slug}</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!card) {
		return (
			<SafeAreaView className="flex-1 bg-brand-neutrals-darkBackground">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg text-white">Card not found</Text>
				</View>
			</SafeAreaView>
		);
	}

	const educationalSection = card.card_sections.find(
		(s) => s.type === "educational",
	);
	const guidedSection = card.card_sections.find((s) => s.type === "guided");

	return (
		<SafeAreaView className="flex-1 bg-brand-neutrals-darkBackground">
			{currentSection === "educational" && educationalSection && (
				<EducationalQuiz
					card={card}
					section={educationalSection}
					onComplete={handleEducationalComplete}
					onExit={handleExit}
				/>
			)}

			{currentSection === "guided" && guidedSection && (
				<GuidedDiscovery
					card={card}
					section={guidedSection}
					onComplete={handleGuidedComplete}
					onExit={handleExit}
					educationalScore={educationalScore}
				/>
			)}

			{currentSection === "completed" && (
				<QuizCompletionModal
					card={card}
					score={educationalScore}
					onProceedToDiscovery={handleCardComplete}
					onBackToHome={handleExit}
					onClose={handleExit}
				/>
			)}
		</SafeAreaView>
	);
} 