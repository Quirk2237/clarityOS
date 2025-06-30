import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { H2, H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HeartsDisplay } from "@/components/ui/hearts-display";
import { useAuth } from "@/context/supabase-provider";
import {
	updateUserProgress,
	recordQuestionAttempt,
	awardAchievement,
} from "@/lib/database-helpers";
import { Database } from "@/lib/database.types";

type Card = Database["public"]["Tables"]["cards"]["Row"] & {
	card_sections: (Database["public"]["Tables"]["card_sections"]["Row"] & {
		questions: (Database["public"]["Tables"]["questions"]["Row"] & {
			answer_choices: Database["public"]["Tables"]["answer_choices"]["Row"][];
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
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-6xl mb-4">💔</Text>
					<H2 className="text-center mb-4">No hearts left!</H2>
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
		<SafeAreaView className="flex-1 bg-background">
			{/* Header with progress and hearts */}
			<View className="p-4 border-b border-border">
				<View className="flex-row justify-between items-center mb-3">
					<Button variant="ghost" size="sm" onPress={onExit}>
						<Text className="text-lg">✕</Text>
					</Button>

					<View className="items-center">
						<H3 className="text-center font-bold">{card.name}</H3>
						<Text className="text-sm text-muted-foreground">
							Learn the basics
						</Text>
					</View>

					<HeartsDisplay current={hearts} total={5} size="sm" />
				</View>

				<Progress
					value={currentQuestionIndex + (showResult ? 1 : 0)}
					max={questions.length}
					showLabel={false}
					className="h-3"
					variant="default"
				/>

				<Text className="text-center text-sm text-muted-foreground mt-2">
					Question {currentQuestionIndex + 1} of {questions.length}
				</Text>
			</View>

			{/* Question Content */}
			<ScrollView className="flex-1 p-4">
				<View className="mb-8">
					<H2 className="text-center mb-6 leading-tight">
						{currentQuestion?.question_text}
					</H2>

					<View className="gap-3">
						{answerChoices.map((choice) => {
							let variant: "outline" | "secondary" | "success" | "destructive" =
								"outline";

							if (selectedAnswer === choice.id && showResult) {
								variant = choice.is_correct ? "success" : "destructive";
							} else if (selectedAnswer === choice.id) {
								variant = "secondary";
							} else if (
								showResult &&
								choice.is_correct &&
								selectedAnswer !== choice.id
							) {
								variant = "success";
							}

							return (
								<Button
									key={choice.id}
									variant={variant}
									size="lg"
									onPress={() => handleAnswerSelect(choice.id)}
									disabled={showResult}
									className="p-4 min-h-16 justify-start"
								>
									<View className="flex-row items-center justify-between w-full">
										<Text className="text-left flex-1 text-base">
											{choice.choice_text}
										</Text>
										{showResult && choice.is_correct && (
											<Text className="text-lg ml-2">✓</Text>
										)}
										{showResult &&
											selectedAnswer === choice.id &&
											!choice.is_correct && (
												<Text className="text-lg ml-2">✗</Text>
											)}
									</View>
								</Button>
							);
						})}
					</View>

					{/* Result feedback */}
					{showResult && (
						<View className="mt-6 p-4 rounded-xl bg-card border border-border">
							{selectedAnswer &&
							answerChoices.find((a) => a.id === selectedAnswer)?.is_correct ? (
								<View className="items-center">
									<Text className="text-2xl mb-2">🎉</Text>
									<Text className="text-center font-semibold text-success">
										Correct! Great job!
									</Text>
								</View>
							) : (
								<View className="items-center">
									<Text className="text-2xl mb-2">💪</Text>
									<Text className="text-center font-semibold text-destructive mb-2">
										Not quite right
									</Text>
									<Text className="text-center text-sm text-muted-foreground">
										The correct answer is highlighted above. Keep learning!
									</Text>
								</View>
							)}
						</View>
					)}
				</View>
			</ScrollView>

			{/* Continue Button */}
			{showResult && (
				<View className="p-4 border-t border-border">
					<Button variant="default" size="lg" onPress={handleNext}>
						<Text className="font-semibold">
							{currentQuestionIndex < questions.length - 1
								? "Continue"
								: "Complete Quiz"}
						</Text>
					</Button>
				</View>
			)}
		</SafeAreaView>
	);
}
