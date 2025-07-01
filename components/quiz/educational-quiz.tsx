import React from "react";
import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Subtitle, Title } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HeartsDisplay } from "@/components/ui/hearts-display";
import { useAuth } from "../../context/supabase-provider";
import {
	updateUserProgress,
	recordQuestionAttempt,
	awardAchievement,
} from "../../lib/database-helpers";
import { Database } from "../../lib/database.types";

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
	onComplete: (score: number, achievements: any[]) => void;
	onExit: () => void;
}

interface QuestionAttempt {
	questionId: string;
	selectedAnswerId: string;
	isCorrect: boolean;
	timeSpent: number;
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
	const [hearts, setHearts] = useState(5);
	const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
	const [startTime] = useState(Date.now());
	const [questionStartTime, setQuestionStartTime] = useState(Date.now());

	const questions = section.questions.sort(
		(a, b) => a.order_index - b.order_index,
	);
	const currentQuestion = questions[currentQuestionIndex];
	const answerChoices =
		currentQuestion?.answer_choices?.sort(
			(a, b) => a.order_index - b.order_index,
		) || [];

	useEffect(() => {
		setQuestionStartTime(Date.now());
	}, [currentQuestionIndex]);

	const handleAnswerSelect = async (answerId: string) => {
		if (showResult || !session) return;

		setSelectedAnswer(answerId);
		const isCorrect =
			answerChoices.find((a) => a.id === answerId)?.is_correct || false;
		const timeSpent = Date.now() - questionStartTime;

		// Record the attempt
		const attempt: QuestionAttempt = {
			questionId: currentQuestion.id,
			selectedAnswerId: answerId,
			isCorrect,
			timeSpent,
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

		if (!isCorrect) {
			setHearts((prev) => Math.max(0, prev - 1));
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

		// Time bonus (faster answers get bonus points)
		const avgTimePerQuestion =
			attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions;
		const timeBonus = Math.max(
			0,
			Math.min(20, 20 - avgTimePerQuestion / 1000 / 10),
		); // Bonus for answering under 10 seconds average

		// Heart bonus (keeping hearts gives bonus)
		const heartBonus = hearts * 2; // 2 points per remaining heart

		const finalScore = Math.min(100, baseScore + timeBonus + heartBonus);

		return {
			finalScore: Math.round(finalScore),
			correctAnswers,
			totalQuestions,
			accuracy: Math.round(accuracy * 100),
			timeBonus: Math.round(timeBonus),
			heartBonus,
		};
	};

	const completeQuiz = async () => {
		if (!session) return;

		const scoreData = calculateScore();
		const achievements: any[] = [];

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

			// Award achievements
			if (scoreData.accuracy === 100) {
				const perfectScore = await awardAchievement(
					session.user.id,
					"perfect_score",
					{
						cardSlug: card.slug,
						sectionName: section.name,
						score: scoreData.finalScore,
					},
				);
				if (perfectScore.data) achievements.push(perfectScore.data);
			}

			if (scoreData.finalScore >= 90) {
				const fastLearner = await awardAchievement(
					session.user.id,
					"fast_learner",
					{
						cardSlug: card.slug,
						sectionName: section.name,
						score: scoreData.finalScore,
					},
				);
				if (fastLearner.data) achievements.push(fastLearner.data);
			}
		} catch (error) {
			console.error("Error completing quiz:", error);
		}

		onComplete(scoreData.finalScore, achievements);
	};

	if (hearts === 0) {
		return (
			<SafeAreaView className="flex-1 bg-neutral-900">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-6xl mb-4">💔</Text>
					<Title className="text-center mb-4">No hearts left!</Title>
					<Text className="text-center text-muted-foreground mb-6">
						Don&apos;t worry, you can try again. Learning takes practice!
					</Text>
					<Button variant="default" size="lg" onPress={onExit}>
						<Text>Try Again Later</Text>
					</Button>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center">
			{/* Centered Card Container */}
			<View className="w-[92%] max-w-xl rounded-3xl p-4 pt-6 pb-0 shadow-lg items-stretch justify-between min-h-[80%]" style={{ minHeight: 520, backgroundColor: "#ACFF64" }}>
				{/* Close Button */}
				<View className="absolute left-4 top-4 z-10">
					<Button
						variant="ghost"
						size="icon"
						onPress={onExit}
						className="w-12 h-12 rounded-full items-center justify-center"
						style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
					>
						<Text className="text-2xl">✕</Text>
					</Button>
				</View>

				{/* Quiz Content */}
				<View className="flex-1 justify-between">
					{/* Question */}
					<Text className="text-2xl font-bold text-black mb-6 mt-2 text-left leading-tight">
						{currentQuestion?.question_text}
					</Text>

					{/* Answer Choices Grid */}
					<View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
						{answerChoices.map((choice, idx) => {
							const isSelected = selectedAnswer === choice.id;
							const isCorrect = showResult && choice.is_correct;
							const isWrong = showResult && isSelected && !choice.is_correct;
							let borderColor = 'border-transparent';
							if (isCorrect) borderColor = 'border-green-500';
							else if (isWrong) borderColor = 'border-red-400';
							else if (isSelected) borderColor = 'border-black';
							const bgColor = isSelected ? 'bg-white/80' : 'bg-white';
							return (
								<Button
									key={choice.id}
									variant="ghost"
									onPress={() => setSelectedAnswer(choice.id)}
									disabled={showResult}
									className={`w-[48%] min-h-28 rounded-2xl p-4 items-center justify-center border-2 ${bgColor} ${borderColor}`}
									style={{ flexBasis: '48%' }}
								>
									{choice.icon && (
										<Text className="text-3xl mb-2">{choice.icon}</Text>
									)}
									<Text className="text-center text-base font-medium text-black">
										{choice.choice_text}
									</Text>
								</Button>
							);
						})}
					</View>

					{/* Feedback (optional, after check) */}
					{showResult && (
						<View className="mt-2 mb-4 p-4 rounded-xl bg-white/80 border border-black/20 items-center">
							{selectedAnswer && answerChoices.find((a) => a.id === selectedAnswer)?.is_correct ? (
								<Text className="text-xl font-semibold text-green-700">Correct! Great job! 🎉</Text>
							) : (
								<>
									<Text className="text-xl font-semibold text-red-600 mb-1">Not quite right</Text>
									<Text className="text-center text-base text-neutral-700">The correct answer is highlighted above. Keep learning!</Text>
								</>
							)}
						</View>
					)}
				</View>

				{/* Spacer for bottom controls */}
				<View className="h-2" />

				{/* Check Button */}
				<View className="w-full mb-2">
					<Button
						variant="default"
						size="lg"
						disabled={!selectedAnswer || showResult}
						onPress={() => {
							if (selectedAnswer) handleAnswerSelect(selectedAnswer);
						}}
						className="w-full rounded-2xl"
						style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
					>
						<Text className="font-semibold text-lg text-black">Check</Text>
					</Button>
				</View>

				{/* Progress Bar */}
				<View className="w-full mt-1 mb-2">
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
