import React from "react";
import { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Subtitle, Title } from "@/components/ui/typography";
import { Button, TransparentIcon } from "@/components/ui/button";
import { Image } from "../image";

import { QuizCompletionModal } from "./quiz-completion-modal";
import { useAuth } from "../../context/supabase-provider";
import { ProgressManager } from "../../lib/progress-manager";
import { Database } from "../../lib/database.types";
import { colors } from "@/constants/colors";

// Add shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

type Card = Database["public"]["Tables"]["cards"]["Row"] & {
	card_sections: (Database["public"]["Tables"]["card_sections"]["Row"] & {
		questions: (Database["public"]["Tables"]["questions"]["Row"] & {
			answer_choices: (Database["public"]["Tables"]["answer_choices"]["Row"] & {
				icon: string | null;
				selectedIcon: string | null;
			})[];
		})[];
	})[];
};

type Section = Database["public"]["Tables"]["card_sections"]["Row"] & {
	questions: (Database["public"]["Tables"]["questions"]["Row"] & {
		answer_choices: (Database["public"]["Tables"]["answer_choices"]["Row"] & {
			selectedIcon: string | null;
		})[];
	})[];
};

interface EducationalQuizProps {
	card: Card;
	section: Section;
	onComplete: (score: number) => void;
	onExit: () => void;
}

interface QuestionAttempt {
	questionId: string;
	selectedAnswerId: string;
	isCorrect: boolean;
}

export function EducationalQuiz({
	card,
	section,
	onComplete,
	onExit,
}: EducationalQuizProps) {
	const { session } = useAuth();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
	const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
	const [showCompletionModal, setShowCompletionModal] = useState(false);
	const [finalScore, setFinalScore] = useState(0);
	const [isLoadingProgress, setIsLoadingProgress] = useState(true);
	
	// Add state to store shuffled answer choices
	const [shuffledAnswerChoices, setShuffledAnswerChoices] = useState<any[]>([]);
	
	// STATE FOR UNLIMITED RETRY FUNCTIONALITY
	const [shouldTryAgain, setShouldTryAgain] = useState(false);

	const questions = section.questions.sort(
		(a, b) => a.order_index - b.order_index,
	);
	const currentQuestion = questions[currentQuestionIndex];

	// Function to shuffle current question's answer choices
	const shuffleCurrentAnswerChoices = () => {
		if (currentQuestion?.answer_choices) {
			const sortedChoices = currentQuestion.answer_choices.sort(
				(a, b) => a.order_index - b.order_index,
			);
			const shuffled = shuffleArray(sortedChoices);
			setShuffledAnswerChoices(shuffled);
		}
	};

	// Load saved progress when component mounts
	useEffect(() => {
		const loadProgress = async () => {
			try {
				const progressManager = new ProgressManager(session);
				const result = await progressManager.getProgress(card.id);
				
				// Handle the response structure
				const progressData = result?.data || result;
				
				if (progressData) {
					// For authenticated users, progressData might be an array or single object
					// For unauthenticated users, it's an array from local storage
					let currentQuestionId = null;
					
					if (Array.isArray(progressData)) {
						// Find the progress entry for this card and section
						const cardProgress = progressData.find(p => 
							(p.cardId === card.id || p.card_id === card.id) && 
							(p.sectionId === section.id || p.section_id === section.id)
						);
						currentQuestionId = cardProgress?.questionId || cardProgress?.question_id;
					} else if (progressData.question_id || progressData.questionId) {
						// Single progress object
						currentQuestionId = progressData.question_id || progressData.questionId;
					}
					
					if (currentQuestionId) {
						// Find the index of the saved question
						const savedQuestionIndex = questions.findIndex(
							q => q.id === currentQuestionId
						);
						
						if (savedQuestionIndex !== -1) {
							setCurrentQuestionIndex(savedQuestionIndex);
						}
					}
				}
			} catch (error) {
				console.error("Error loading progress:", error);
			}
			
			setIsLoadingProgress(false);
		};

		loadProgress();
	}, [session?.user?.id, card.id, section.id, questions]);

	// Shuffle answer choices when question changes
	useEffect(() => {
		shuffleCurrentAnswerChoices();
	}, [currentQuestion]);

	const handleAnswerSelect = async (answerId: string) => {
		if (hasCheckedAnswer && !shouldTryAgain) return;

		// Add haptic feedback when answer is selected
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		setSelectedAnswer(answerId);
		
		// If user selects a different answer after getting one wrong, reset the checked state
		if (shouldTryAgain && hasCheckedAnswer) {
			setHasCheckedAnswer(false);
			setShowResult(false);
			setShouldTryAgain(false);
		}
	};

	const handleCheckAnswer = async () => {
		if (!selectedAnswer) return;

		const isCorrect = shuffledAnswerChoices.find((a) => a.id === selectedAnswer)?.is_correct || false;
		
		setHasCheckedAnswer(true);
		setShowResult(true);

		if (isCorrect) {
			// Correct answer - record attempt
			const attempt: QuestionAttempt = {
				questionId: currentQuestion.id,
				selectedAnswerId: selectedAnswer,
				isCorrect: true,
			};

			setAttempts((prev) => [...prev, attempt]);
			
			// Save progress
			try {
				const progressManager = new ProgressManager(session);
				await progressManager.recordQuestionAttempt(
					currentQuestion.id,
					selectedAnswer,
					undefined,
					true,
					10,
				);

				await progressManager.updateProgress(
					card.id,
					{
						status: "in_progress",
						questionId: currentQuestion.id,
					},
					section.id,
					currentQuestion.id,
				);
			} catch (error) {
				console.error("Error saving progress:", error);
			}

			setShouldTryAgain(false);
		} else {
			// Wrong answer - allow retry
			setShouldTryAgain(true);
		}
	};

	const handleTryAgain = () => {
		setSelectedAnswer(null);
		setShowResult(false);
		setHasCheckedAnswer(false);
		setShouldTryAgain(false);
		// Shuffle choices again when trying again
		shuffleCurrentAnswerChoices();
	};

	const handleNext = () => {
		if (shouldTryAgain) {
			handleTryAgain();
		} else if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedAnswer(null);
			setShowResult(false);
			setHasCheckedAnswer(false);
			setShouldTryAgain(false);
			// Shuffling will happen automatically via useEffect when currentQuestion changes
		} else {
			completeQuiz();
		}
	};

	const calculateScore = () => {
		const correctAnswers = attempts.filter((a) => a.isCorrect).length;
		const totalQuestions = attempts.length;
		const accuracy = correctAnswers / totalQuestions;

		// Base score (0-100 based on accuracy)
		const baseScore = Math.round(accuracy * 100);

		return {
			finalScore: baseScore,
			correctAnswers,
			totalQuestions,
			accuracy: Math.round(accuracy * 100),
		};
	};

	const completeQuiz = async () => {
		const scoreData = calculateScore();

		try {
			// Update final progress using ProgressManager
			const progressManager = new ProgressManager(session);
			
			await progressManager.updateProgress(
				card.id,
				{
					status: "completed",
					score: scoreData.finalScore,
					totalQuestions: scoreData.totalQuestions,
					correctAnswers: scoreData.correctAnswers,
					completedAt: new Date().toISOString(),
				},
				section.id,
			);
		} catch (error) {
			console.error("Error completing quiz:", error);
		}

		// Show completion modal instead of immediately calling onComplete
		setFinalScore(scoreData.finalScore);
		setShowCompletionModal(true);
	};

	const handleProceedToDiscovery = () => {
		setShowCompletionModal(false);
		onComplete(finalScore); // This will trigger navigation to guided discovery
	};

	const handleBackToHome = () => {
		setShowCompletionModal(false);
		onExit(); // This will go back to home/card selection
	};

	const handleCloseModal = () => {
		setShowCompletionModal(false);
		// Stay on current screen - user can continue or exit manually
	};

	// Show completion modal if quiz is completed
	if (showCompletionModal) {
		return (
			<QuizCompletionModal
				card={card}
				score={finalScore}
				onProceedToDiscovery={handleProceedToDiscovery}
				onBackToHome={handleBackToHome}
				onClose={handleCloseModal}
			/>
		);
	}

	// Show loading state while progress is being loaded
	if (isLoadingProgress) {
		return (
			<SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center px-4">
				<View 
					className="w-full max-w-xl rounded-3xl p-8 shadow-lg items-center justify-center" 
					style={{ backgroundColor: colors.primary, minHeight: 200 }}
				>
					<Text className="text-xl font-semibold text-black">Loading your progress...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<View className="flex-1 justify-start items-center px-4 pt-8">
			<View 
				className="w-full max-w-xl rounded-3xl p-3 shadow-lg" 
				style={{ backgroundColor: colors.primary }}
			>
				{/* Close Button */}
				<View style={{ position: 'absolute', left: 16, top: 16, zIndex: 10 }}>
					<TransparentIcon onPress={onExit}>
						<Text className="text-white text-lg font-bold">✕</Text>
					</TransparentIcon>
				</View>

				{/* Question */}
				<View style={{ paddingTop: 80, marginBottom: 20 }}>
					<Text className="text-2xl font-bold text-black text-left leading-tight">
						{currentQuestion?.question_text}
					</Text>
				</View>

				{/* Answer Choices Grid */}
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
					{shuffledAnswerChoices.map((choice, idx) => {
						const isSelected = selectedAnswer === choice.id;
						const isCorrect = hasCheckedAnswer && showResult && isSelected && choice.is_correct;
						const isWrong = hasCheckedAnswer && showResult && isSelected && !choice.is_correct;

						return (
							<View 
								key={choice.id} 
								style={{ 
									width: '48%',
									marginBottom: 16,
									position: 'relative'
								}}
							>
								<Pressable
									onPress={() => handleAnswerSelect(choice.id)}
									disabled={hasCheckedAnswer && !shouldTryAgain}
									className="w-full rounded-3xl"
									style={{
										minHeight: 140, // Minimum height
										padding: 16,
										flexDirection: 'column',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
										backgroundColor: 'white',
										borderWidth: isSelected && !hasCheckedAnswer ? 3 : 0,
										borderColor: isSelected && !hasCheckedAnswer ? colors.primary : 'transparent',
										...(isWrong && {
											borderWidth: 2,
											borderColor: colors.error,
											backgroundColor: 'white',
										}),
										...(isSelected && {
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 4 },
											shadowOpacity: 0.15,
											shadowRadius: 12,
											elevation: 6,
										})
									}}
								>
														{/* Icon/Image - will be pushed to top by justifyContent: 'space-between' */}
					<View>
						{(() => {
							// Determine which icon to show based on selection state
							const iconToShow = isSelected && choice.selectedIcon
								? choice.selectedIcon  // Use selectedIcon if available and answer is selected
								: choice.icon;         // Fall back to regular icon
							
							return iconToShow && (
								<Image
									source={{ uri: iconToShow }}
									contentFit="contain"
									style={{
										width: 35,
										height: 35,
									}}
								/>
							);
						})()}
					</View>
									
									{/* Text - will be pushed to bottom by justifyContent: 'space-between' */}
									<Text 
										className="text-black leading-tight"
										style={{ 
											fontSize: 14,
											lineHeight: 18,
											textAlign: 'left'
										}}
									>
										{choice.choice_text}
									</Text>
								</Pressable>

								{/* Correct Answer Indicator - Green Circle with Checkmark */}
								{isCorrect && (
									<View 
										className="absolute rounded-full items-center justify-center"
										style={{
											width: 28,
											height: 28,
											top: 12,
											right: 12,
											backgroundColor: '#9EEC5A',
										}}
									>
										<Text className="text-white text-lg font-bold">✓</Text>
									</View>
								)}

								{/* Wrong Answer Indicator */}
								{isWrong && (
									<View 
										className="absolute rounded-full items-center justify-center"
										style={{
											width: 28,
											height: 28,
											top: 12,
											right: 12,
											backgroundColor: colors.error,
										}}
									>
										<Text className="text-white text-lg font-bold">✕</Text>
									</View>
								)}




							</View>
						);
					})}
				</View>



				{/* Continue Button */}
				<View style={{ marginBottom: 20, marginTop: 8 }}>
					<Pressable
						onPress={
							hasCheckedAnswer && showResult 
								? handleNext 
								: selectedAnswer && !hasCheckedAnswer 
									? handleCheckAnswer
									: undefined
						}
						className="w-full rounded-2xl py-4 items-center justify-center"
						style={{ 
							backgroundColor: (selectedAnswer || showResult) ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.3)",
							opacity: (selectedAnswer || showResult) ? 1 : 0.5,
							minHeight: 56,
						}}
					>
						<Text 
							className="font-semibold text-lg"
							style={{ 
								color: (selectedAnswer || showResult) ? "#000" : "#666",
							}}
						>
							{hasCheckedAnswer && showResult ? (
								shouldTryAgain ? "Try Again" : 
								currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Quiz"
							) : selectedAnswer && !hasCheckedAnswer ? "Check Answer" : "Select an Answer"}
						</Text>
					</Pressable>
				</View>

			</View>

			{/* Progress Dots */}
			<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
				{questions.map((_, index) => {
					const isCompleted = index < currentQuestionIndex || (index === currentQuestionIndex && showResult && !shouldTryAgain);
					const isCurrent = index === currentQuestionIndex && (!showResult || shouldTryAgain);
					
					return (
						<View
							key={index}
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								marginHorizontal: 4,
								backgroundColor: isCompleted 
									? colors.primary 
									: isCurrent 
										? 'rgba(158, 236, 90, 0.5)' 
										: 'rgba(255, 255, 255, 0.3)',
							}}
						/>
					);
				})}
			</View>
		</View>
	);
}
