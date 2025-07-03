import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Subtitle, Title } from "../ui/typography";
import { Button, PrimaryButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../../context/supabase-provider";
import { z } from "zod";
import { ProgressManager } from "../../lib/progress-manager";
import { useAIChat } from "./useAIChat";
import { LocalAIStorage } from "../../lib/local-storage";
import { Database } from "../../lib/database.types";
import { AIErrorBoundary } from "../ai-error-boundary";
import { colors } from "../../constants/colors";

// Zod schema for the structured response from the AI
const ClaritySchema = z.object({
	question: z
		.string()
		.describe(
			'The next conversational, open-ended question to ask the user to dig deeper into their brand.',
		),
	isComplete: z
		.boolean()
		.describe(
			"A boolean flag indicating if the brand discovery for this section is complete based on the user's input.",
		),
	scores: z.object({
		audience: z
			.number()
			.min(0)
			.max(2)
			.describe("Score (0-2) for how well the user defined their target audience."),
		benefit: z
			.number()
			.min(0)
			.max(2)
			.describe("Score (0-2) for the clarity and compellingness of the user benefit."),
		belief: z
			.number()
			.min(0)
			.max(2)
			.describe("Score (0-2) for the strength of the underlying brand belief or value."),
		impact: z
			.number()
			.min(0)
			.max(2)
			.describe("Score (0-2) for the tangible impact or outcome for the customer."),
	}),
	draftStatement: z
		.string()
		.optional()
		.describe("A draft brand statement, generated only when isComplete is true."),
});

type Card = Database["public"]["Tables"]["cards"]["Row"];
type Section = Database["public"]["Tables"]["card_sections"]["Row"];

interface GuidedDiscoveryProps {
	card: Card;
	section: Section;
	onComplete: () => void;
	onExit: () => void;
	educationalScore: number;
}

interface ConversationState {
	step: "opening" | "follow_up" | "synthesis" | "validation" | "refinement" | "complete";
	scores: {
		audience: number;
		benefit: number;
		belief: number;
		impact: number;
	};
	draftStatement?: string;
	validationFeedback?: "yes" | "no" | "not_sure";
	refinementArea?: "audience" | "what" | "why" | "belief";
}

// ScoreWidgets component for displaying the 4 scoring dimensions
interface ScoreWidgetsProps {
	scores: {
		audience: number;
		benefit: number;
		belief: number;
		impact: number;
	};
	cardSlug: string;
}

// Simple circular progress component for React Native
interface CircularProgressProps {
	value: number;
	maxValue: number;
	size: number;
	strokeWidth: number;
	color: string;
	backgroundColor: string;
}

function CircularProgress({ value, maxValue, size, strokeWidth, color, backgroundColor }: CircularProgressProps) {
	const percentage = (value / maxValue) * 100;
	const radius = (size - strokeWidth) / 2;
	
	return (
		<View
			className="items-center justify-center"
			style={{ width: size, height: size }}
		>
			{/* Background circle */}
			<View
				className="absolute rounded-full"
				style={{
					width: size,
					height: size,
					borderWidth: strokeWidth,
					borderColor: backgroundColor,
				}}
			/>
			
			{/* Progress arc - simplified approach for React Native */}
			{percentage > 0 && (
				<View
					className="absolute rounded-full"
					style={{
						width: size,
						height: size,
						borderWidth: strokeWidth,
						borderColor: 'transparent',
						borderTopColor: percentage >= 25 ? color : 'transparent',
						borderRightColor: percentage >= 50 ? color : 'transparent', 
						borderBottomColor: percentage >= 75 ? color : 'transparent',
						borderLeftColor: percentage >= 100 ? color : (percentage >= 25 ? color : 'transparent'),
						transform: [{ rotate: '-90deg' }],
					}}
				/>
			)}
		</View>
	);
}

function ScoreWidgets({ scores, cardSlug }: ScoreWidgetsProps) {
	// Get score labels based on card type
	const getScoreLabels = (cardSlug: string) => {
		const labelMap: { [key: string]: { [key: string]: string } } = {
			purpose: {
				audience: "Audience score",
				benefit: "Benefit score", 
				belief: "Belief score",
				impact: "Impact score"
			},
			positioning: {
				audience: "Target score",
				benefit: "Advantage score",
				belief: "Differentiation score", 
				impact: "Value score"
			},
			personality: {
				audience: "Traits score",
				benefit: "Communication score",
				belief: "Values score",
				impact: "Attitude score"
			},
			"product-market-fit": {
				audience: "Market need score",
				benefit: "Solution score",
				belief: "Target clarity score",
				impact: "Differentiation score"
			},
			perception: {
				audience: "Current awareness score",
				benefit: "Desired image score",
				belief: "Gap recognition score",
				impact: "Customer evidence score"
			},
			presentation: {
				audience: "Visual consistency score",
				benefit: "Message clarity score",
				belief: "Touchpoint strategy score",
				impact: "Brand cohesion score"
			},
			proof: {
				audience: "Evidence quality score",
				benefit: "Credibility score",
				belief: "Achievement score",
				impact: "Results score"
			}
		};
		
		return labelMap[cardSlug] || labelMap.purpose;
	};

	const labels = getScoreLabels(cardSlug);
	const maxScore = 2; // Each dimension is scored 0-2

	const scoreItems = [
		{ key: 'audience', label: labels.audience, score: scores.audience },
		{ key: 'benefit', label: labels.benefit, score: scores.benefit },
		{ key: 'belief', label: labels.belief, score: scores.belief },
		{ key: 'impact', label: labels.impact, score: scores.impact }
	];

	return (
		<View className="flex-row flex-wrap gap-4">
			{scoreItems.map((item) => (
				<View 
					key={item.key}
					className="flex-1 min-w-[45%] rounded-2xl p-4 flex-row items-center"
					style={{ minWidth: '45%', backgroundColor: colors.surface }}
				>
					{/* Circular Progress */}
					<View className="mr-3">
						<CircularProgress
							value={item.score}
							maxValue={maxScore}
							size={36}
							strokeWidth={6}
							color={colors.primary}
							backgroundColor="#444444"
						/>
					</View>
					
					{/* Label */}
					<Text style={{ color: colors.background }} className="text-sm font-medium leading-tight flex-1">
						{item.label}
					</Text>
				</View>
			))}
		</View>
	);
}

// Component removed debugging utility

export function GuidedDiscovery({
	card,
	section,
	onComplete,
	onExit,
	educationalScore,
}: GuidedDiscoveryProps) {
	const { session } = useAuth();
	const synthesisForced = useRef(false);
	const [conversationState, setConversationState] = useState<ConversationState>(
		{
			step: "opening",
			scores: { audience: 0, benefit: 0, belief: 0, impact: 0 },
		},
	);
	const [isCompleted, setIsCompleted] = useState(false);
	// Removed debugInfo state
	const [currentQuestion, setCurrentQuestion] = useState<string>("");
	const [isInitialized, setIsInitialized] = useState(false);

	// ✅ Generate anonymous user ID for unauthenticated users
	const [anonymousUserId] = useState(() => 
		`anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	);
	
	// ✅ Use authenticated user ID or anonymous ID
	const effectiveUserId = session?.user?.id || anonymousUserId;
	const isAuthenticated = !!session?.user?.id;

	// Chat headers for API requests
	const chatHeaders = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${
			session?.access_token || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
		}`,
	};

	const completionInProgress = useRef(false);

	// Helper function to get contextual example text based on the current question
	const getContextualExampleText = (question: string, cardSlug: string) => {
		// If no question yet, return generic placeholder
		if (!question) return "Share your thoughts here...";
		
		// Analyze the question content to provide relevant examples
		const lowerQuestion = question.toLowerCase();
		
		// Question-specific examples based on content analysis
		if (lowerQuestion.includes("disappeared") || lowerQuestion.includes("miss")) {
			return "E.g., 'Our customers would miss our eco-friendly packaging because it helps them live sustainably.'";
		}
		
		if (lowerQuestion.includes("unique") || lowerQuestion.includes("different")) {
			return "E.g., 'We're the only platform that combines AI analytics with human insight for small businesses.'";
		}
		
		if (lowerQuestion.includes("audience") || lowerQuestion.includes("customers") || lowerQuestion.includes("target")) {
			return "E.g., 'Small business owners who struggle with data analysis and want simple, actionable insights.'";
		}
		
		if (lowerQuestion.includes("benefit") || lowerQuestion.includes("value") || lowerQuestion.includes("solve")) {
			return "E.g., 'We save them 10 hours per week by automating their most tedious reporting tasks.'";
		}
		
		if (lowerQuestion.includes("personality") || lowerQuestion.includes("character") || lowerQuestion.includes("brand feels")) {
			return "E.g., 'Our brand is like a trusted friend - approachable, reliable, and always honest.'";
		}
		
		if (lowerQuestion.includes("belief") || lowerQuestion.includes("values") || lowerQuestion.includes("stand for")) {
			return "E.g., 'We believe every small business deserves access to enterprise-level insights.'";
		}
		
		if (lowerQuestion.includes("impact") || lowerQuestion.includes("outcome") || lowerQuestion.includes("result")) {
			return "E.g., 'Our clients typically see a 30% increase in decision-making speed within 3 months.'";
		}
		
		if (lowerQuestion.includes("proof") || lowerQuestion.includes("evidence") || lowerQuestion.includes("results")) {
			return "E.g., 'We've helped 500+ businesses reduce their carbon footprint by 30% on average.'";
		}
		
		if (lowerQuestion.includes("position") || lowerQuestion.includes("compete") || lowerQuestion.includes("market")) {
			return "E.g., 'We're positioned as the sustainable choice for environmentally conscious consumers.'";
		}
		
		if (lowerQuestion.includes("perception") || lowerQuestion.includes("image") || lowerQuestion.includes("seen")) {
			return "E.g., 'Customers see us as the premium, environmentally conscious choice in our market.'";
		}
		
		if (lowerQuestion.includes("presentation") || lowerQuestion.includes("visual") || lowerQuestion.includes("look")) {
			return "E.g., 'Our visual identity uses earth tones and clean typography to convey sustainability and trust.'";
		}
		
		// Fallback to card-specific examples
		const cardExamples = {
			purpose: "E.g., 'Our customers would miss our eco-friendly packaging because it helps them live sustainably.'",
			positioning: "E.g., 'We're the only platform that combines AI analytics with human insight for small businesses.'",
			personality: "E.g., 'Our brand is like a trusted friend - approachable, reliable, and always honest.'",
			"product-market-fit": "E.g., 'Small business owners struggle with data analysis, and our simple dashboard solves this perfectly.'",
			perception: "E.g., 'Customers see us as the premium, environmentally conscious choice in our market.'",
			presentation: "E.g., 'Our visual identity uses earth tones and clean typography to convey sustainability and trust.'",
			proof: "E.g., 'We've helped 500+ businesses reduce their carbon footprint by 30% on average.'"
		};
		
		return cardExamples[cardSlug as keyof typeof cardExamples] || "Share your thoughts here...";
	};

	// Component initialization
	useEffect(() => {
		// Set initial question
		setCurrentQuestion(
			card.slug === "purpose"
				? "Imagine your brand disappeared tomorrow. What would your customers miss most, and why would that matter?"
				: `Tell me about your brand and what makes it unique in the ${card.name.toLowerCase()} space.`
		);

		setIsInitialized(true);
	}, [card]);

	// Save conversation state to appropriate storage
	const saveConversationState = async () => {
		try {
			if (isAuthenticated) {
				const progressManager = new ProgressManager(session);
				await progressManager.saveAIConversation(
					card.id,
					{ conversationState },
					conversationState.step,
					isCompleted,
				);
			} else {
				await LocalAIStorage.saveConversation(
					card.id,
					{ conversationState },
					conversationState.step,
					isCompleted
				);
			}
		} catch (error: any) {
			// Handle error silently
		}
	};

	// ✅ Replace useObject with custom hook
	const { 
		input, 
		setInput, 
		isLoading, 
		error, 
		data: aiResponse,
		handleSubmit
	} = useAIChat<z.infer<typeof ClaritySchema>>({
		endpoint: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler`,
		schema: ClaritySchema,
		headers: chatHeaders,
		body: {
			task: card.slug,
			userId: effectiveUserId,
		},
		onError: (error) => {
			debug.error("❌ AI Chat Error", {
				message: error.message,
				endpoint: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler`,
				userId: effectiveUserId,
				timestamp: new Date().toISOString(),
			});
		},
	});

	// ✅ Process structured data from the AI when it's available
	useEffect(() => {
		if (!aiResponse) return;

		try {
			debug.log("📊 Structured AI Response", aiResponse);

			// Update conversation state with structured data
			setConversationState((prev) => {
				const newState = { ...prev };

				// Update scores directly from structured response
				newState.scores = {
					audience: Math.max(prev.scores.audience, aiResponse.scores.audience),
					benefit: Math.max(prev.scores.benefit, aiResponse.scores.benefit),
					belief: Math.max(prev.scores.belief, aiResponse.scores.belief),
					impact: Math.max(prev.scores.impact, aiResponse.scores.impact),
				};

				// Update step and draft statement based on completion status
				if (aiResponse.isComplete) {
					// Always go to synthesis phase for validation when AI completes
					newState.step = "synthesis";
					newState.draftStatement = aiResponse.draftStatement;
					// Reset validation state for fresh review
					newState.validationFeedback = undefined;
					newState.refinementArea = undefined;
					debug.log("Synthesis Phase Started", {
						isComplete: aiResponse.isComplete,
						draftStatement: aiResponse.draftStatement,
						previousStep: prev.step,
					});
				}

				return newState;
			});

			// Update current question from structured response
			if (aiResponse.question && aiResponse.question !== currentQuestion) {
				setCurrentQuestion(aiResponse.question);
				debug.log("Question Updated from JSON", {
					newQuestion: aiResponse.question,
				});
			}

			// Don't auto-complete anymore - let user validate the statement first
			// Completion now happens through user interaction in the synthesis/validation phases
		} catch (parseError: any) {
			debug.warn("Data Parse Error", {
				error: parseError,
				message: "AI returned non-JSON data object",
			});
			console.warn(
				"Expected JSON object from AI handler, but received:",
				aiResponse,
			);
		}
	}, [aiResponse]);

	// ✅ Add intensive debugging for useAIChat state changes
	useEffect(() => {
		debug.log("🔄 useAIChat State Update", {
			isLoading,
			hasError: !!error,
			errorMessage: error?.message,
			lastResponse: aiResponse,
			timestamp: new Date().toISOString(),
		});
	}, [isLoading, error, aiResponse]);

	// ✅ FIXED: Use useEffect to save conversation state when it changes
	useEffect(() => {
		if (isInitialized) {
			debug.log("💾 Saving Conversation State", {
				conversationStep: conversationState.step,
				isCompleted,
				isAuthenticated,
				timestamp: new Date().toISOString()
			});
			
			const saveTimeout = setTimeout(() => {
				saveConversationState();
			}, 100);
			
			return () => clearTimeout(saveTimeout);
		}
	}, [conversationState, isCompleted, isInitialized]);

	// ✅ Force completion if scores are maxed but AI hasn't completed
	useEffect(() => {
		const { scores, step } = conversationState;
		const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
		const maxScore = 8; // 4 dimensions * 2 points max

		if (
			totalScore >= maxScore &&
			(step === "opening" || step === "follow_up") &&
			!synthesisForced.current
		) {
			debug.log("Client-Side Completion", "Scores maxed, forcing synthesis request.");
			synthesisForced.current = true;

			const finalRequestInput =
				"Based on our conversation, all criteria for a strong brand purpose statement have been met. Please provide the final draft statement for my review, setting isComplete to true.";
			setInput(finalRequestInput);

			// Defer submission to avoid state update issues within render cycle
			setTimeout(() => {
				handleSubmit({ preventDefault: () => {} } as any);
			}, 50);
		}
	}, [conversationState]);

	// ✅ Load existing conversation from appropriate storage
	const loadExistingConversation = async () => {
		try {
			if (isAuthenticated) {
				const progressManager = new ProgressManager(session);
				const { data, error } = await progressManager.getAIConversation(card.id);

				if (error) {
					debug.error("Load Conversation Error", error);
					return;
				}

				if (data && data.conversation_data?.conversationState) {
					debug.log("Previous Database Conversation Found", {
						conversationId: data.id,
						step: data.current_step,
						isCompleted: data.is_completed,
					});
					
					const loadedState = data.conversation_data.conversationState;
					if (data.is_completed) {
						loadedState.step = "complete";
					}
					setConversationState(loadedState);
					setIsCompleted(data.is_completed);
				}
			} else {
				const localConversation = await LocalAIStorage.getConversation(card.id);
				
				if (localConversation && localConversation.conversationData?.conversationState) {
					debug.log("Previous Local Conversation Found", {
						conversationId: localConversation.id,
						step: localConversation.currentStep,
						isCompleted: localConversation.isCompleted,
					});
					
					const loadedState = localConversation.conversationData.conversationState;
					if (localConversation.isCompleted) {
						loadedState.step = "complete";
					}
					setConversationState(loadedState);
					setIsCompleted(localConversation.isCompleted);
				}
			}
		} catch (error: any) {
			debug.error("Load Conversation Exception", error);
		}
	};

	// ✅ Load conversation on component mount
	useEffect(() => {
		if (isInitialized) {
			loadExistingConversation();
		}
	}, [isAuthenticated, card.id, isInitialized]);

	const handleRestart = () => {
		synthesisForced.current = false;
		debug.log("🔄 Restarting Card", { cardId: card.id });
		setConversationState({
			step: "opening",
			scores: { audience: 0, benefit: 0, belief: 0, impact: 0 },
		});
		setIsCompleted(false);
		setCurrentQuestion(
			card.slug === "purpose"
				? "Imagine your brand disappeared tomorrow. What would your customers miss most, and why would that matter?"
				: `Tell me about your brand and what makes it unique in the ${card.name.toLowerCase()} space.`,
		);
		setInput(""); // Clear user input
	};

	const handleCompletion = async () => {
		if (completionInProgress.current) return;
		completionInProgress.current = true;
		debug.log("🏁 Handling Completion", {
			draftStatement: conversationState.draftStatement,
			scores: conversationState.scores,
		});

		try {
			// Set completion state and save
			setConversationState(prev => ({ ...prev, step: "complete" }));
			setIsCompleted(true);
			await saveConversationState();

			// Mark the guided section as completed and save progress
			if (session) {
				const progressManager = new ProgressManager(session);
				
				// Mark guided section as completed
				await progressManager.updateProgress(
					card.id,
					{
						status: "completed",
						completedAt: new Date().toISOString(),
					},
					section.id
				);

				// Save the brand purpose statement if authenticated
				if (conversationState.draftStatement) {
					await progressManager.saveBrandPurposeStatement(
						conversationState.draftStatement,
						conversationState.scores.audience,
						conversationState.scores.benefit,
						conversationState.scores.belief,
						conversationState.scores.impact,
					);
				}
			}

			debug.log("✅ Completion Logic Finished", { card: card.slug });
		} catch (error: any) {
			debug.error("Completion Error", error);
		} finally {
			completionInProgress.current = false;
		}
	};

	const calculateProgress = () => {
		const totalPossibleScore = 8;
		const currentScore = Object.values(conversationState.scores).reduce(
			(sum, score) => sum + score,
			0,
		);
		const progress = Math.min(
			100,
			(currentScore / totalPossibleScore) * 100,
		);
		debug.log("📊 Progress Calculation", {
			currentScore,
			totalPossibleScore,
			progress,
		});
		return progress;
	};

	return (
		<AIErrorBoundary>
			<View className="flex-1">
				{/* Header */}
				<View className="p-4 flex-row justify-between items-center" style={{ borderBottomWidth: 1, borderBottomColor: colors.surface }}>
					<Title style={{ color: colors.background }}>{card.name}</Title>
					<Button variant="white" onPress={onExit}>
						<Text>Exit</Text>
					</Button>
				</View>

					{/* Main Content */}
					<ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
						{/* Question Container - White Background - Show during discovery and refinement phases */}
						{(conversationState.step === "opening" || conversationState.step === "follow_up" || conversationState.step === "refinement") && (
							<>
								<View className="rounded-3xl p-6 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
									{/* Gray Question Box */}
									<View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#F5F5F5' }}>
										{isLoading ? (
											<View className="items-center justify-center py-4">
												<Text className="text-lg mb-2 text-gray-800">Thinking...</Text>
												<View className="w-6 h-6 rounded-full" style={{ 
													borderWidth: 2, 
													borderColor: colors.primary, 
													borderTopColor: 'transparent' 
												}} />
											</View>
										) : (
											<Text className="text-lg font-medium leading-relaxed text-gray-800">
												{currentQuestion}
											</Text>
										)}
									</View>

									{/* White Input Area with Placeholder */}
									<View>
										<Textarea
											value={input}
											onChangeText={setInput}
											placeholder={getContextualExampleText(currentQuestion, card.slug)}
											className="rounded-2xl p-4 min-h-[100px]"
											style={{ 
												backgroundColor: '#FFFFFF',
												borderWidth: 1, 
												borderColor: '#E5E5E5', 
												color: '#000000',
												fontSize: 16,
												lineHeight: 22
											}}
											placeholderTextColor="#999999"
											editable={!isLoading}
											multiline
										/>
									</View>
								</View>

								{/* Action Buttons - Below the white container */}
								<View className="flex-row gap-3 mb-6">
									{/* Examples Button */}
									<PrimaryButton
										onPress={() => {
											console.log("Examples button pressed");
											setInput("I'd like to explore this question further with some guidance.");
											handleSubmit({ preventDefault: () => {} } as any);
										}}
										className="flex-1 py-3 px-6"
										style={{ height: 44 }}
										disabled={isLoading}
									>
										<Text className="font-medium text-base" style={{ color: '#000000' }}>
											Examples?
										</Text>
									</PrimaryButton>
									
									{/* Submit/Arrow Button */}
									<PrimaryButton
										onPress={() => {
											if (!input.trim() || isLoading) return;
											handleSubmit({ preventDefault: () => {} } as any);
										}}
										style={{ width: 44, height: 44 }}
										disabled={isLoading || !input.trim()}
									>
										<Text className="font-bold text-lg" style={{ color: '#000000' }}>
											→
										</Text>
									</PrimaryButton>
								</View>
							</>
						)}

						{/* Progress Scores - Always show */}
						<View className="mb-6">
							<ScoreWidgets scores={conversationState.scores} cardSlug={card.slug} />
						</View>

						{/* Synthesis Phase - Show Draft Statement */}
						{conversationState.step === "synthesis" && conversationState.draftStatement && (
							<View className="rounded-3xl p-6 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
								<Text className="text-lg font-medium mb-3 text-gray-800">
									Thanks — based on everything you've shared, here's a first draft of your brand purpose statement:
								</Text>
								
								<View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface }}>
									<Text className="text-lg leading-relaxed font-medium" style={{ color: colors.background }}>
										{conversationState.draftStatement}
									</Text>
								</View>
								
								<Text className="text-base mb-4 text-gray-800">
									Does this feel true to your brand?
								</Text>
								
								<View className="flex-row gap-3">
									<PrimaryButton
										onPress={() => {
											setConversationState(prev => ({
												...prev,
												step: "validation",
												validationFeedback: "yes"
											}));
										}}
										className="flex-1 py-3"
									>
										<Text className="font-medium" style={{ color: '#000000' }}>Yes</Text>
									</PrimaryButton>
									
									<Button
										onPress={() => {
											setConversationState(prev => ({
												...prev,
												step: "validation",
												validationFeedback: "not_sure"
											}));
										}}
										className="flex-1 py-3"
										variant="white"
									>
										<Text className="font-medium">Not sure</Text>
									</Button>
									
									<Button
										onPress={() => {
											setConversationState(prev => ({
												...prev,
												step: "validation",
												validationFeedback: "no"
											}));
										}}
										className="flex-1 py-3"
										variant="white"
									>
										<Text className="font-medium">No</Text>
									</Button>
								</View>
							</View>
						)}

						{/* Validation Phase - Handle Yes Response */}
						{conversationState.step === "validation" && conversationState.validationFeedback === "yes" && (
							<View className="rounded-3xl p-6 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
								<Text className="text-lg font-medium mb-3 text-gray-800">
									Great! Would you like to:
								</Text>
								
								<View className="gap-3">
									<PrimaryButton
										onPress={async () => {
											await handleCompletion();
										}}
										className="py-3"
									>
										<Text className="font-medium" style={{ color: '#000000' }}>Save this and continue</Text>
									</PrimaryButton>
									
									<Button
										onPress={() => {
											setInput("I'd like to polish the tone and style of this statement.");
											setCurrentQuestion("What aspects of the tone or style would you like to adjust?");
											setConversationState(prev => ({ ...prev, step: "refinement" }));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">Polish tone or style</Text>
									</Button>
								</View>
							</View>
						)}

						{/* Validation Phase - Handle No/Not Sure Response */}
						{conversationState.step === "validation" && (conversationState.validationFeedback === "no" || conversationState.validationFeedback === "not_sure") && (
							<View className="rounded-3xl p-6 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
								<Text className="text-lg font-medium mb-3 text-gray-800">
									No problem! Which part doesn't feel quite right?
								</Text>
								
								<View className="gap-3">
									<Button
										onPress={() => {
											setInput("The audience/who we serve doesn't feel quite right.");
											setCurrentQuestion("Tell me more about who you really serve. What's not quite right about how I described your audience?");
											setConversationState(prev => ({ ...prev, step: "refinement", refinementArea: "audience" }));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The who (audience)</Text>
									</Button>
									
									<Button
										onPress={() => {
											setInput("What we do/offer doesn't feel quite right.");
											setCurrentQuestion("Help me understand better what you actually do or offer. What's missing or incorrect in my description?");
											setConversationState(prev => ({ ...prev, step: "refinement", refinementArea: "what" }));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The what (what you do)</Text>
									</Button>
									
									<Button
										onPress={() => {
											setInput("The why/purpose doesn't feel quite right.");
											setCurrentQuestion("What's the real reason you exist? What feels off about the 'why' I described?");
											setConversationState(prev => ({ ...prev, step: "refinement", refinementArea: "why" }));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The why (purpose)</Text>
									</Button>
									
									<Button
										onPress={() => {
											setInput("The belief/values don't feel quite right.");
											setCurrentQuestion("What do you really believe? What values are most important to your brand that I might have missed?");
											setConversationState(prev => ({ ...prev, step: "refinement", refinementArea: "belief" }));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The belief (values)</Text>
									</Button>
								</View>
							</View>
						)}

						{/* Refinement Phase - Info Banner */}
						{conversationState.step === "refinement" && (
							<View className="rounded-3xl p-4 mb-6" style={{ 
								backgroundColor: 'rgba(172, 255, 100, 0.1)', 
								borderWidth: 1, 
								borderColor: colors.primary 
							}}>
								<Text className="text-base text-center" style={{ color: colors.background }}>
									💭 I'm refining your purpose statement based on your feedback
								</Text>
							</View>
						)}

						{/* Final Completion State - The Plaque */}
						{conversationState.step === "complete" && (
							<>
								<View className="rounded-3xl p-6 mb-6" style={{ backgroundColor: colors.surface }}>
									<Title className="mb-4 text-center" style={{ color: colors.primary }}>Your Brand Purpose</Title>
									<View className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#000000' }}>
										<Text className="text-lg leading-relaxed text-center font-medium" style={{ color: colors.background }}>
											{conversationState.draftStatement || "No statement saved."}
										</Text>
									</View>
								</View>
								
								<View className="gap-3">
									<PrimaryButton
										onPress={() => {
											// Logic to refine statement
											setInput(conversationState.draftStatement || "");
											setCurrentQuestion("What aspects of your statement would you like to refine?");
											setConversationState(prev => ({ ...prev, step: "refinement" }));
											setIsCompleted(false);
										}}
										className="py-3"
									>
										<Text className="font-medium" style={{ color: '#000000' }}>Refine Purpose Statement</Text>
									</PrimaryButton>
						
									<Button
										onPress={handleRestart}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">Restart Card</Text>
									</Button>
									
									<Button
										onPress={onExit}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">Go Home</Text>
									</Button>
								</View>
							</>
						)}
				</ScrollView>
			</View>
		</AIErrorBoundary>
	);
}
