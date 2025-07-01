import React from "react";
import { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Subtitle, Title } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Image } from "../image";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../../context/supabase-provider";
import {
	updateUserProgress,
	recordQuestionAttempt,
} from "../../lib/database-helpers";
import { Database } from "../../lib/database.types";
import { colors } from "@/constants/colors";

type Card = Database["public"]["Tables"]["cards"]["Row"] & {
	card_sections: (Database["public"]["Tables"]["card_sections"]["Row"] & {
		questions: (Database["public"]["Tables"]["questions"]["Row"] & {
			answer_choices: (Database["public"]["Tables"]["answer_choices"]["Row"] & {
				icon: string | null;
			})[];
		})[];
	})[];
};

type Section = Database["public"]["Tables"]["card_sections"]["Row"] & {
	questions: (Database["public"]["Tables"]["questions"]["Row"] & {
		answer_choices: Database["public"]["Tables"]["answer_choices"]["Row"][];
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
	const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);

	const questions = section.questions.sort(
		(a, b) => a.order_index - b.order_index,
	);
	const currentQuestion = questions[currentQuestionIndex];
	const answerChoices =
		currentQuestion?.answer_choices?.sort(
			(a, b) => a.order_index - b.order_index,
		) || [];

	const handleAnswerSelect = async (answerId: string) => {
		if (showResult || !session) return;

		setSelectedAnswer(answerId);
		const isCorrect =
			answerChoices.find((a) => a.id === answerId)?.is_correct || false;

		// Record the attempt
		const attempt: QuestionAttempt = {
			questionId: currentQuestion.id,
			selectedAnswerId: answerId,
			isCorrect,
		};

		setAttempts((prev) => [...prev, attempt]);

		// Save to database
		try {
			await recordQuestionAttempt(
				session.user.id,
				currentQuestion.id,
				answerId,
				undefined,
				isCorrect,
				isCorrect ? 10 : 0,
			);

			await updateUserProgress(
				session.user.id,
				card.id,
				{
					status: "in_progress",
					question_id: currentQuestion.id,
				},
				section.id,
				currentQuestion.id,
			);
		} catch (error) {
			console.error("Error saving progress:", error);
		}

		setShowResult(true);
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedAnswer(null);
			setShowResult(false);
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
		if (!session) return;

		const scoreData = calculateScore();

		try {
			// Update final progress
			await updateUserProgress(
				session.user.id,
				card.id,
				{
					status: "completed",
					score: scoreData.finalScore,
					total_questions: scoreData.totalQuestions,
					correct_answers: scoreData.correctAnswers,
					completed_at: new Date().toISOString(),
				},
				section.id,
			);
		} catch (error) {
			console.error("Error completing quiz:", error);
		}

		onComplete(scoreData.finalScore);
	};

	return (
		<SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center px-4">
			{/* Centered Card Container */}
			<View 
				className="w-full max-w-xl rounded-3xl p-3 shadow-lg" 
				style={{ backgroundColor: colors.primary }}
			>
				{/* Close Button */}
				<View style={{ position: 'absolute', left: 16, top: 16, zIndex: 10 }}>
					<Button
						variant="white"
						size="icon"
						onPress={onExit}
						className="w-12 h-12 rounded-full items-center justify-center"
						style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
					>
						<Text className="text-2xl">✕</Text>
					</Button>
				</View>

				{/* Question */}
				<View style={{ paddingTop: 56, marginBottom: 20 }}>
					<Text className="text-2xl font-bold text-black text-left leading-tight">
						{currentQuestion?.question_text}
					</Text>
				</View>

				{/* Answer Choices Grid */}
				<View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
					{answerChoices.map((choice, idx) => {
						const isSelected = selectedAnswer === choice.id;
						const isCorrect = showResult && isSelected && choice.is_correct;
						const isWrong = showResult && isSelected && !choice.is_correct;
						const shouldShowCorrectAnswer = showResult && !isSelected && choice.is_correct && selectedAnswer && !answerChoices.find(a => a.id === selectedAnswer)?.is_correct;
						
						// Determine card styling based on state
						let cardStyle = 'bg-white';

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
									onPress={() => !showResult && handleAnswerSelect(choice.id)}
									disabled={showResult}
									className={`w-full rounded-3xl p-4 ${cardStyle}`}
									style={{
										minHeight: 120,
										alignItems: 'flex-start',
										justifyContent: 'flex-start',
										...(isSelected && {
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.1,
											shadowRadius: 8,
											elevation: 3,
										})
									}}
								>
									{/* Icon/Image */}
									<View className="mb-6">
										{choice.icon && (
											<Image
												source={{ uri: choice.icon }}
												contentFit="contain"
												style={{
													width: 40,
													height: 40,
												}}
											/>
										)}
									</View>
									
									{/* Text */}
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
										className="absolute bg-green-500 rounded-full items-center justify-center"
										style={{
											width: 32,
											height: 32,
											top: 12,
											right: 12,
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.2,
											shadowRadius: 4,
											elevation: 4,
										}}
									>
										<Text className="text-white text-lg font-bold">✓</Text>
									</View>
								)}

								{/* Wrong Answer Indicator */}
								{isWrong && (
									<View 
										className="absolute bg-red-500 rounded-full items-center justify-center"
										style={{
											width: 32,
											height: 32,
											top: 12,
											right: 12,
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.2,
											shadowRadius: 4,
											elevation: 4,
										}}
									>
										<Text className="text-white text-lg font-bold">✕</Text>
									</View>
								)}

								{/* Show Correct Answer when user was wrong */}
								{shouldShowCorrectAnswer && (
									<View 
										className="absolute bg-green-500 rounded-full items-center justify-center"
										style={{
											width: 32,
											height: 32,
											top: 12,
											right: 12,
											shadowColor: '#000',
											shadowOffset: { width: 0, height: 2 },
											shadowOpacity: 0.2,
											shadowRadius: 4,
											elevation: 4,
										}}
									>
										<Text className="text-white text-lg font-bold">✓</Text>
									</View>
								)}

								{/* Selected Indicator (when not showing results) */}
								{isSelected && !showResult && (
									<View 
										className="absolute bg-blue-500 rounded-full items-center justify-center"
										style={{
											width: 24,
											height: 24,
											top: 16,
											right: 16,
										}}
									>
										<View className="w-3 h-3 bg-white rounded-full" />
									</View>
								)}
							</View>
						);
					})}
				</View>

				{/* Feedback (optional, after check) */}
				{showResult && (
					<View className="p-4 rounded-xl bg-white/80 border border-black/20 items-center" style={{ marginBottom: 20 }}>
						{selectedAnswer && answerChoices.find((a) => a.id === selectedAnswer)?.is_correct ? (
							<Text className="text-lg font-semibold text-green-700">Correct! Great job! 🎉</Text>
						) : (
							<>
								<Text className="text-lg font-semibold text-red-600 mb-1">Not quite right</Text>
								<Text className="text-center text-sm text-neutral-700">The correct answer is highlighted above. Keep learning!</Text>
							</>
						)}
					</View>
				)}

				{/* Continue Button */}
				<View style={{ marginBottom: 20, marginTop: 8 }}>
					<Button
						variant="white"
						size="lg"
						disabled={!showResult}
						onPress={handleNext}
						className="w-full rounded-2xl py-4"
						style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
					>
						<Text className="font-semibold text-lg text-black">Continue</Text>
					</Button>
				</View>

				{/* Progress Bar */}
				<View>
					<Progress
						value={currentQuestionIndex + (showResult ? 1 : 0)}
						max={questions.length}
						showLabel={false}
						className="h-3 rounded-full"
						style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
						variant="default"
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}
