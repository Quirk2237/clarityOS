import { useState, useEffect } from "react";
import { View, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/supabase-provider";
import { getCard, getUserProgress } from "@/lib/database-helpers";
import {
	EducationalQuiz,
	GuidedDiscovery,
	CompletionScreen,
} from "@/components/quiz";
import { Database } from "@/lib/database.types";

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
	const [achievements, setAchievements] = useState<any[]>([]);

	useEffect(() => {
		if (slug && session) {
			loadCardAndProgress();
		}
	}, [slug, session]);

	const loadCardAndProgress = async () => {
		try {
			// Load card data
			const { data: cardData, error: cardError } = await getCard(slug);
			if (cardError) throw cardError;

			if (!cardData) {
				throw new Error("Card not found");
			}

			setCard(cardData);

			// Load user progress for this card (only if session exists)
			if (!session?.user?.id) {
				setCurrentSection("educational");
				return;
			}

			const { data: progressData, error: progressError } = await getUserProgress(
				session.user.id, 
				cardData.id
			);

			if (progressError) {
				console.error("Error loading progress:", progressError);
			}

			// Determine which section to start with based on progress
			const educationalSection = cardData.card_sections.find(
				(s: Database["public"]["Tables"]["card_sections"]["Row"]) => s.type === "educational"
			);
			const guidedSection = cardData.card_sections.find(
				(s: Database["public"]["Tables"]["card_sections"]["Row"]) => s.type === "guided"
			);

			let startingSection: Section = "educational";

			if (progressData && progressData.length > 0) {
				// Check if educational section is completed
				const educationalCompleted = progressData.some(
					p => p.section_id === educationalSection?.id && p.status === "completed"
				);

				// Check if guided section is completed
				const guidedCompleted = progressData.some(
					p => p.section_id === guidedSection?.id && p.status === "completed"
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
					p => p.section_id === educationalSection?.id
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

	const handleEducationalComplete = (
		score: number,
		earnedAchievements: any[],
	) => {
		setEducationalScore(score);
		setAchievements(earnedAchievements);
		setCurrentSection("guided");
	};

	const handleGuidedComplete = () => {
		setCurrentSection("completed");
	};

	const handleExit = () => {
		router.back();
	};

	const handleCardComplete = () => {
		router.push("/(protected)/(tabs)/" as any);
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg">Loading...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!card) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg">Card not found</Text>
				</View>
			</SafeAreaView>
		);
	}

	const educationalSection = card.card_sections.find(
		(s) => s.type === "educational",
	);
	const guidedSection = card.card_sections.find((s) => s.type === "guided");

	return (
		<SafeAreaView className="flex-1 bg-background">
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
				<CompletionScreen
					card={card}
					finalScore={educationalScore}
					achievements={achievements}
					onContinue={handleCardComplete}
				/>
			)}
		</SafeAreaView>
	);
}
