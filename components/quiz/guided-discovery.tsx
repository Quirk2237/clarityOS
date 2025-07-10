import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Modal } from "react-native";
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	useAnimatedGestureHandler,
	withSpring,
	runOnJS,
	interpolate,
	Extrapolate,
} from 'react-native-reanimated';
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
import { useBusinessContext, getBusinessDescription } from "../../lib/use-business-context";

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

interface QuestionAnswer {
	question: string;
	answer: string;
	timestamp: number;
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
	questionHistory: QuestionAnswer[];
	currentQuestion?: string; // ✅ ADD: Store the current question in state
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
	const [activePopup, setActivePopup] = useState<string | null>(null);

	// Get score explanations based on card type
	const getScoreExplanations = (cardSlug: string) => {
		const explanationMap: { [key: string]: { [key: string]: string } } = {
			purpose: {
				audience: "How clearly you've defined who your brand serves. A higher score means you have a specific, well-defined target audience.",
				benefit: "How compelling and clear your brand's benefit is to customers. A higher score means you've articulated a valuable outcome.",
				belief: "How strong your underlying brand values and beliefs are. A higher score means you have a clear philosophical foundation.",
				impact: "How tangible and measurable your brand's impact is on customers. A higher score means you can clearly demonstrate results."
			},
			positioning: {
				audience: "How well you've identified your target market. A higher score means you understand exactly who you're positioning for.",
				benefit: "How clear your competitive advantage is. A higher score means you've identified what makes you uniquely valuable.",
				belief: "How distinct your brand differentiation is. A higher score means you stand out clearly from competitors.",
				impact: "How compelling your value proposition is. A higher score means customers understand why they should choose you."
			},
			personality: {
				audience: "How well-defined your brand traits are. A higher score means you have clear personality characteristics.",
				benefit: "How consistent your communication style is. A higher score means your voice is recognizable and coherent.",
				belief: "How strong your brand values are. A higher score means your beliefs guide your personality authentically.",
				impact: "How distinctive your brand attitude is. A higher score means your personality creates a memorable impression."
			},
			"product-market-fit": {
				audience: "How well you understand the market need. A higher score means you've identified a real, pressing problem.",
				benefit: "How well your solution addresses the need. A higher score means your product solves the problem effectively.",
				belief: "How clear your target customer definition is. A higher score means you know exactly who needs your solution.",
				impact: "How distinct your differentiation is. A higher score means you offer something competitors don't."
			},
			perception: {
				audience: "How aware you are of current brand perception. A higher score means you understand how you're currently seen.",
				benefit: "How clear your desired brand image is. A higher score means you know exactly how you want to be perceived.",
				belief: "How well you recognize perception gaps. A higher score means you understand what needs to change.",
				impact: "How strong your customer evidence is. A higher score means you have proof of how customers actually see you."
			},
			presentation: {
				audience: "How consistent your visual identity is. A higher score means your brand looks cohesive across touchpoints.",
				benefit: "How clear your messaging is. A higher score means your communication is easy to understand and remember.",
				belief: "How strategic your touchpoint approach is. A higher score means you're intentional about where you show up.",
				impact: "How unified your brand experience is. A higher score means everything works together seamlessly."
			},
			proof: {
				audience: "How strong your evidence is. A higher score means you have compelling proof of your claims.",
				benefit: "How credible your brand appears. A higher score means customers trust what you say.",
				belief: "How significant your achievements are. A higher score means you've accomplished meaningful milestones.",
				impact: "How measurable your results are. A higher score means you can demonstrate clear outcomes."
			}
		};
		
		return explanationMap[cardSlug] || explanationMap.purpose;
	};

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
	const explanations = getScoreExplanations(cardSlug);
	const maxScore = 2; // Each dimension is scored 0-2

	const scoreItems = [
		{ key: 'audience', label: labels.audience, score: scores.audience, explanation: explanations.audience },
		{ key: 'benefit', label: labels.benefit, score: scores.benefit, explanation: explanations.benefit },
		{ key: 'belief', label: labels.belief, score: scores.belief, explanation: explanations.belief },
		{ key: 'impact', label: labels.impact, score: scores.impact, explanation: explanations.impact }
	];

	return (
		<>
			<View className="flex-row flex-wrap gap-4">
				{scoreItems.map((item) => (
					<Pressable
						key={item.key}
						className="flex-1 min-w-[45%] rounded-2xl p-4 flex-row items-center"
						style={{ minWidth: '45%', backgroundColor: '#383838' }}
						onPress={() => setActivePopup(item.key)}
					>
					{/* Circular Progress */}
					<View className="mr-3">
						<CircularProgress
							value={item.score}
							maxValue={maxScore}
							size={28}
							strokeWidth={4}
							color={colors.primary}
							backgroundColor="#444444"
						/>
					</View>
					
					{/* Label */}
					<Text style={{ color: colors.background }} className="text-sm font-medium leading-tight flex-1">
						{item.label}
					</Text>
					
					{/* Help Circle Icon - Right aligned */}
					<View 
						className="items-center justify-center rounded-full"
						style={{ 
							width: 20, 
							height: 20, 
							backgroundColor: '#444444' 
						}}
					>
						<Text 
							style={{ 
								color: '#383838', 
								fontSize: 12, 
								fontWeight: 'bold' 
							}}
						>
							?
						</Text>
					</View>
				</Pressable>
			))}
		</View>

		{/* Score Explanation Modal */}
		<Modal
			visible={activePopup !== null}
			transparent={true}
			animationType="fade"
			onRequestClose={() => setActivePopup(null)}
		>
			<View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
				<View className="mx-4 rounded-3xl p-6 max-w-sm w-full" style={{ backgroundColor: colors.surface }}>
					{activePopup && (
						<>
							<Text className="text-xl font-bold mb-4" style={{ color: colors.background }}>
								{scoreItems.find(item => item.key === activePopup)?.label}
							</Text>
							<Text className="text-base leading-relaxed mb-6" style={{ color: colors.background }}>
								{scoreItems.find(item => item.key === activePopup)?.explanation}
							</Text>
							<PrimaryButton
								onPress={() => setActivePopup(null)}
								className="py-3"
							>
								<Text className="font-medium" style={{ color: '#000000' }}>Got it</Text>
							</PrimaryButton>
						</>
					)}
				</View>
			</View>
		</Modal>
	</>
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
	// Guard against undefined card
	if (!card) {
		return (
			<AIErrorBoundary>
				<View className="flex-1 items-center justify-center p-6">
					<Text className="text-lg text-center" style={{ color: colors.background }}>
						Card data is not available. Please try again.
					</Text>
					<Button variant="white" onPress={onExit} className="mt-4">
						<Text>Go Back</Text>
					</Button>
				</View>
			</AIErrorBoundary>
		);
	}

	const { session } = useAuth();
	const businessContext = useBusinessContext(); // Add business context hook
	const synthesisForced = useRef(false);
	const [conversationState, setConversationState] = useState<ConversationState>(
		{
			step: "opening",
			scores: { audience: 0, benefit: 0, belief: 0, impact: 0 },
			questionHistory: [],
			currentQuestion: undefined, // Will be set when conversation loads or initializes
		},
	);
	const [isCompleted, setIsCompleted] = useState(false);
	// Removed debugInfo state
	const [currentQuestion, setCurrentQuestion] = useState<string>("");
	const [isInitialized, setIsInitialized] = useState(false);
	const [currentStackIndex, setCurrentStackIndex] = useState(0);
	const cardHeights = useSharedValue<{ [key: string]: number }>({});

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

	// ✅ FIX: Component initialization - don't set question immediately
	useEffect(() => {
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

	// ✅ Replace useObject with custom hook and include business context
	const { 
		input, 
		setInput, 
		isLoading, 
		error, 
		data: aiResponse,
		handleSubmit: originalHandleSubmit
	} = useAIChat<z.infer<typeof ClaritySchema>>({
		endpoint: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler`,
		schema: ClaritySchema,
		headers: chatHeaders,
		body: {
			task: card.slug,
			userId: effectiveUserId,
			businessContext: {
				hasData: businessContext.hasData,
				businessName: businessContext.business_name,
				businessStage: businessContext.business_stage,
				businessStageOther: businessContext.business_stage_other,
				whatYourBusinessDoes: businessContext.what_your_business_does,
				source: businessContext.source,
				businessDescription: getBusinessDescription(businessContext),
			},
		},
		onError: (error) => {
			console.error("❌ AI Chat Error", {
				message: error.message,
				endpoint: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler`,
				userId: effectiveUserId,
				timestamp: new Date().toISOString(),
			});
		},
	});

	// Enhanced handleSubmit to store question/answer history
	const handleSubmit = (e: any) => {
		if (!input.trim()) return;
		
		// Add current question and answer to history
		setConversationState(prev => ({
			...prev,
			questionHistory: [
				...prev.questionHistory,
				{
					question: currentQuestion,
					answer: input.trim(),
					timestamp: Date.now()
				}
			]
		}));

		// Reset stack to show current question
		setCurrentStackIndex(0);
		
		// Call original submit
		originalHandleSubmit(e);
	};

	// ✅ Process structured data from the AI when it's available
	useEffect(() => {
		if (!aiResponse) return;

		try {
			console.log("📊 Structured AI Response", aiResponse);

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
				console.log("Synthesis Phase Started", {
					isComplete: aiResponse.isComplete,
					draftStatement: aiResponse.draftStatement,
					hasDraftStatement: !!aiResponse.draftStatement,
					previousStep: prev.step,
				});
				
				// If no draft statement provided, request one
				if (!aiResponse.draftStatement) {
					console.warn("AI marked complete but no draft statement provided - requesting synthesis");
				}
			}

				return newState;
			});

			// Update current question from structured response
			if (aiResponse.question && aiResponse.question !== currentQuestion) {
				setCurrentQuestion(aiResponse.question);
				// ✅ FIX: Clear input for new question
				setInput("");
				// ✅ FIX: Let the useEffect handle currentStackIndex automatically
				console.log("Question Updated from JSON", {
					newQuestion: aiResponse.question,
				});
				
				// ✅ FIX: Update conversation state with new current question
				setConversationState(prev => ({
					...prev,
					currentQuestion: aiResponse.question
				}));
			}

			// Don't auto-complete anymore - let user validate the statement first
			// Completion now happens through user interaction in the synthesis/validation phases
		} catch (parseError: any) {
			console.warn("Data Parse Error", {
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
		console.log("🔄 useAIChat State Update", {
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
			console.log("💾 Saving Conversation State", {
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
			console.log("Client-Side Completion", "Scores maxed, forcing synthesis request.");
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
			let conversationLoaded = false;
			
			if (isAuthenticated) {
				const progressManager = new ProgressManager(session);
				const { data, error } = await progressManager.getAIConversation(card.id);

				if (error) {
					console.error("Load Conversation Error", error);
				} else if (data && data.conversation_data?.conversationState) {
					console.log("Previous Database Conversation Found", {
						conversationId: data.id,
						step: data.current_step,
						isCompleted: data.is_completed,
					});
					
					const loadedState = data.conversation_data.conversationState;
					if (data.is_completed) {
						loadedState.step = "complete";
					}
					// Ensure questionHistory exists for backward compatibility
					if (!loadedState.questionHistory) {
						loadedState.questionHistory = [];
					}
					
					setConversationState(loadedState);
					setIsCompleted(data.is_completed);
					
					// ✅ FIX: Restore current question from saved state
					if (loadedState.currentQuestion) {
						setCurrentQuestion(loadedState.currentQuestion);
						console.log("Restored current question:", loadedState.currentQuestion);
					}
					conversationLoaded = true;
				}
			} else {
				const localConversation = await LocalAIStorage.getConversation(card.id);
				
				if (localConversation && localConversation.conversationData?.conversationState) {
					console.log("Previous Local Conversation Found", {
						conversationId: localConversation.id,
						step: localConversation.currentStep,
						isCompleted: localConversation.isCompleted,
					});
					
					const loadedState = localConversation.conversationData.conversationState;
					if (localConversation.isCompleted) {
						loadedState.step = "complete";
					}
					// Ensure questionHistory exists for backward compatibility
					if (!loadedState.questionHistory) {
						loadedState.questionHistory = [];
					}
					
					setConversationState(loadedState);
					setIsCompleted(localConversation.isCompleted);
					
					// ✅ FIX: Restore current question from saved state
					if (loadedState.currentQuestion) {
						setCurrentQuestion(loadedState.currentQuestion);
						console.log("Restored current question:", loadedState.currentQuestion);
					}
					conversationLoaded = true;
				}
			}
			
			// ✅ FIX: If no conversation was loaded, set the initial question
			if (!conversationLoaded) {
				const initialQuestion = card.slug === "purpose"
					? "Imagine your brand disappeared tomorrow. What would your customers miss most, and why would that matter?"
					: `Tell me about your brand and what makes it unique in the ${card.name.toLowerCase()} space.`;
				
				setCurrentQuestion(initialQuestion);
				// ✅ FIX: Update conversation state with initial question
				setConversationState(prev => ({
					...prev,
					currentQuestion: initialQuestion
				}));
				console.log("Set initial question for new conversation:", initialQuestion);
			}
		} catch (error: any) {
			console.error("Load Conversation Exception", error);
			
			// ✅ FIX: Set initial question on error as fallback
			const initialQuestion = card.slug === "purpose"
				? "Imagine your brand disappeared tomorrow. What would your customers miss most, and why would that matter?"
				: `Tell me about your brand and what makes it unique in the ${card.name.toLowerCase()} space.`;
			
			setCurrentQuestion(initialQuestion);
			// ✅ FIX: Update conversation state with initial question
			setConversationState(prev => ({
				...prev,
				currentQuestion: initialQuestion
			}));
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
		console.log("🔄 Restarting Card", { cardId: card.id });
		
		const initialQuestion = card.slug === "purpose"
			? "Imagine your brand disappeared tomorrow. What would your customers miss most, and why would that matter?"
			: `Tell me about your brand and what makes it unique in the ${card.name.toLowerCase()} space.`;
			
		setConversationState({
			step: "opening",
			scores: { audience: 0, benefit: 0, belief: 0, impact: 0 },
			questionHistory: [],
			currentQuestion: initialQuestion, // ✅ FIX: Include current question in state
		});
		setIsCompleted(false);
		// currentStackIndex will be reset by useEffect when stackCards changes
		setCurrentQuestion(initialQuestion);
		setInput(""); // Clear user input
	};

	const handleCompletion = async () => {
		if (completionInProgress.current) return;
		completionInProgress.current = true;
		console.log("🏁 Handling Completion", {
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

			console.log("✅ Completion Logic Finished", { card: card.slug });
		} catch (error: any) {
			console.error("Completion Error", error);
		} finally {
			onComplete();
			completionInProgress.current = false;
		}
	};

	const calculateProgress = () => {
		const { scores } = conversationState;
		const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
		const maxScore = 8; // 4 dimensions * 2 points max
		const progressPercentage = Math.round((totalScore / maxScore) * 100);

		console.log("📊 Progress Calculation", {
			currentScore: totalScore,
			totalPossibleScore: maxScore,
			progress: progressPercentage,
		});
		return progressPercentage;
	};

	// Apple Wallet-style card stack using react-native-reanimated
	const translateY = useSharedValue(0);
	const isGestureActive = useSharedValue(false);
	
	// Dynamic fan configuration - cards positioned 6px above previous card
	const gapBetweenCards = 6;
	const defaultCardHeight = 220; // Fallback height before measurement
	

	
	const gestureHandler = useAnimatedGestureHandler({
		onStart: () => {
			isGestureActive.value = true;
		},
		onActive: (event) => {
			// Smoother pull down with gentle resistance
			const maxPullDown = 300;
			
			if (event.translationY > 0) {
				// Gentle resistance curve - smoother than before
				const resistance = 1 / (1 + event.translationY / 400);
				translateY.value = Math.min(event.translationY * resistance, maxPullDown);
			} else {
				// Pushing up - light compression
				translateY.value = event.translationY * 0.1;
			}
		},
		onEnd: (event) => {
			isGestureActive.value = false;
			
			// Spring back to neutral with gentler settings
			translateY.value = withSpring(0, {
				damping: 15,
				stiffness: 150,
				mass: 0.8,
			});
		},
	});

	// Prepare stack cards
	const stackCards = React.useMemo(() => {
		// ✅ STEP 1: Remove .reverse() so current question is at highest index
		// Only include current question if it exists
		const allCards = currentQuestion 
			? [...conversationState.questionHistory].concat([{ question: currentQuestion, answer: '', timestamp: Date.now() }])
			: [...conversationState.questionHistory];
		
		console.log("Stack Debug:", {
			historyLength: conversationState.questionHistory.length,
			totalCards: allCards.length,
			currentStackIndex,
			currentQuestion: currentQuestion ? currentQuestion.substring(0, 50) + '...' : 'None',
			// ✅ ADD: Debug the order
			cardOrder: allCards.map((card, i) => `${i}: ${card.question ? card.question.substring(0, 30) + '...' : 'No question'}`)
		});
		
		return allCards;
	}, [conversationState.questionHistory, currentQuestion, currentStackIndex]);

	// Create animated style for the expanding stack container
	const stackContainerStyle = useAnimatedStyle(() => {
		const numberOfCards = stackCards.length;
		const visibleCardCount = Math.min(3, numberOfCards); // Show max 3 cards
		
		// Get the current card's height or use default
		const currentCardKey = `${stackCards[stackCards.length - 1]?.timestamp}-${stackCards.length - 1}`;
		const currentCardHeight = cardHeights.value[currentCardKey] || defaultCardHeight;
		
		// ✅ FIX: Always reserve minimum space for stacked cards, even when collapsed
		const minimumStackHeight = currentCardHeight + (visibleCardCount - 1) * 12; // 12px offset per card
		
		// Calculate expansion with each card for fanning animation
		let maxConstrainedOffset = 0;
		for (let j = 0; j < numberOfCards - 1; j++) {
			const cardKey = `${stackCards[j]?.timestamp}-${j}`;
			const cardHeight = cardHeights.value[cardKey] || defaultCardHeight;
			maxConstrainedOffset += cardHeight + gapBetweenCards;
		}
		
		const fanExpansion = interpolate(
			translateY.value,
			[0, 80, 160, 240],
			[
				0, // No extra expansion when collapsed
				maxConstrainedOffset * 0.1, // Very light fanning (10%)
				maxConstrainedOffset * 0.4, // Medium fanning (40%)
				maxConstrainedOffset // Max fanning with exact 6px gaps
			],
			Extrapolate.CLAMP
		);
		
		// ✅ FIX: Use minimum stack height + fan expansion to prevent content overlap
		return {
			height: minimumStackHeight + fanExpansion,
		};
	});

	// Create animated style for the whole stack translation
	const stackTranslationStyle = useAnimatedStyle(() => {
		return {
			// ✅ FIX: Remove translation - let individual cards handle positioning
			// transform: [{ translateY: translateY.value * 0.3 }], // This was moving entire deck
		};
	});

	// Create multiple animated styles for different card positions (Apple Wallet fanning)
	const cardFanStyles = Array.from({ length: 6 }, (_, i) => {
		return useAnimatedStyle(() => {
			// ✅ FIX: Bottom card (index 0) stays completely fixed - NO translateY movement
			if (i === 0) {
				return {
					transform: [
						{ translateY: 0 }, // Force zero movement
						{ scale: 0.95 }
					],
					opacity: 1,
				};
			}
			
			// Bottom card (index 0) stays fixed, others fan down progressively
			const fanMultiplier = i; // 0 for bottom card, increases for cards above
			
			// Calculate cumulative position with each card 6px above the previous one
			let cumulativePosition = 0;
			for (let j = 0; j < fanMultiplier; j++) {
				const cardKey = `${stackCards[j]?.timestamp}-${j}`;
				const cardHeight = cardHeights.value[cardKey] || defaultCardHeight;
				// Position this card 6px below the bottom of the card below it
				cumulativePosition += cardHeight + gapBetweenCards;
			}
			
			const fanOffset = interpolate(
				translateY.value,
				[0, 80, 160, 240],
				[
					0, // No movement when closed
					cumulativePosition * 0.1, // Very light fanning (10%)
					cumulativePosition * 0.4, // Medium fanning (40%)
					cumulativePosition  // Max fanning with exact 6px gaps
				],
				Extrapolate.CLAMP
			);
			
			// Scale effect - current card (highest index) becomes most prominent
			const fanScale = interpolate(
				translateY.value,
				[0, 120, 240],
				[
					i === 5 ? 1 : 0.97, // Current card normal, others smaller
					i === 5 ? 1 : 0.98, // Cards grow when being revealed  
					i === 5 ? 1 : 1.0   // All cards reach good size when fully revealed
				],
				Extrapolate.CLAMP
			);
			
			// All cards fully opaque - no transparency
			const staticOpacity = 1;
			
			return {
				transform: [
					{ translateY: fanOffset },
					{ scale: fanScale }
				],
				opacity: staticOpacity,
			};
		});
	});

	// ✅ FIXED: Create height constraint styles for previous cards (fixed array to avoid hook violations)
	const cardHeightStyles = Array.from({ length: 6 }, (_, i) => {
		return useAnimatedStyle(() => {
			// Get the current card index in the stack
			const currentCardIndex = stackCards.length - 1;
			
			// Never constrain the current (top) card - check if this style array index matches a current card
			const cardAtThisPosition = stackCards[i];
			if (!cardAtThisPosition || i === currentCardIndex) {
				return {}; // No height constraint for current card or non-existent cards
			}
			
			// Get current card height to constrain previous cards
			const currentCardKey = `${stackCards[currentCardIndex]?.timestamp}-${currentCardIndex}`;
			const currentCardHeight = cardHeights.value[currentCardKey] || defaultCardHeight;
			
			// Height constraint based on fanning state - only for previous cards
			const heightConstraint = interpolate(
				translateY.value,
				[0, 80, 160, 240],
				[
					Math.min(currentCardHeight * 0.8, 180), // Constrained when collapsed (80% of current or 180px max)
					currentCardHeight * 0.9, // Slightly less constrained
					currentCardHeight, // Approaching full height
					9999 // Large number = no constraint when fully fanned
				],
				Extrapolate.CLAMP
			);
			
			return heightConstraint < 9999 ? {
				maxHeight: heightConstraint,
				overflow: 'hidden'
			} : {};
		});
	});

	// Initialize currentStackIndex to current question when cards change
	useEffect(() => {
		setCurrentStackIndex(stackCards.length - 1);
	}, [stackCards.length]);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AIErrorBoundary>
				<View className="flex-1 p-4">
														{/* Animated FlatList Deck - Show during discovery and refinement phases */}
				{(conversationState.step === "opening" || conversationState.step === "follow_up" || conversationState.step === "refinement") && (
					<View className="mb-2">
						<PanGestureHandler onGestureEvent={gestureHandler}>
							<Animated.View 
								style={[stackContainerStyle, stackTranslationStyle]}
							>
								{stackCards.map((qa, index) => {
									const isCurrentQuestion = index === stackCards.length - 1;
									const cardRelativeIndex = index - currentStackIndex;
									const distanceFromCurrent = Math.abs(cardRelativeIndex);
									const isVisible = distanceFromCurrent < 3; // Show current + 2 cards above/below
									
									if (!isVisible) return null;
									
									// ✅ STEP 2: Fix z-index - higher index should have higher z-index
									const zIndex = index + 1; // Simple: index 0 = z-index 1, index 1 = z-index 2, etc.
									
									// Get the appropriate animated style for this card position
									// ✅ STEP 3: Simplify card style mapping
									const cardStyleIndex = Math.min(5, index); // Just use index directly, cap at 5
									const cardFanStyle = cardFanStyles[cardStyleIndex];
									const cardHeightStyle = cardHeightStyles[cardStyleIndex]; // ✅ FIXED: Back to array access
									// ✅ FIX: Static offset for stacked appearance when collapsed
									const staticOffset = index * 4;
									
									return (
																			<Animated.View
										key={`${qa.timestamp}-${index}`}
										className="absolute w-full rounded-3xl p-4"
										style={[
											// ✅ FIX: Only apply fan animation to non-bottom cards
											index === 0 ? {} : cardFanStyle, // Skip fan animation for bottom card
											cardHeightStyle, // ✅ NEW: Height constraint for previous cards
											{
												backgroundColor: '#FFFFFF',
												zIndex: zIndex,
												top: staticOffset, // ✅ FIX: Static offset for collapsed state
												// ✅ FIX: Apply scale directly to bottom card
												...(index === 0 ? { transform: [{ scale: 0.95 }] } : {}),
												shadowColor: '#000',
												shadowOffset: {
													width: 0,
													height: distanceFromCurrent * 2 + 4,
												},
												shadowOpacity: cardRelativeIndex === 0 ? 0.1 : 0.3,
												shadowRadius: cardRelativeIndex === 0 ? 6 : 12,
												elevation: zIndex,
											}
										]}
										onLayout={(event) => {
											const { height } = event.nativeEvent.layout;
											const cardKey = `${qa.timestamp}-${index}`;
											cardHeights.value = {
												...cardHeights.value,
												[cardKey]: height
											};
										}}
									>
										{/* Gray Question Box */}
										<View 
											className="rounded-2xl p-3 mb-3" 
											style={{ backgroundColor: '#F5F5F5' }}
										>
												{/* ✅ STEP 5: Simplify loading condition */}
												{isCurrentQuestion && isLoading ? (
													<View className="items-center justify-center py-4">
														<Text className="text-lg mb-2 text-gray-800">Thinking...</Text>
														<View className="w-6 h-6 rounded-full" style={{ 
															borderWidth: 2, 
															borderColor: colors.primary, 
															borderTopColor: 'transparent' 
														}} />
													</View>
												) : (
													<Text 
														className={`${isCurrentQuestion ? 'text-lg font-medium' : 'text-base font-medium'} leading-relaxed text-gray-800`}
													>
														{qa.question}
													</Text>
												)}
											</View>

											{/* Input Area or Answer */}
											<View>
												{/* ✅ STEP 5: Simplify input condition - just use isCurrentQuestion */}
												{isCurrentQuestion ? (
													// Current question - show input
													<Textarea
														value={input}
														onChangeText={setInput}
														placeholder={getContextualExampleText(currentQuestion, card.slug)}
														className="p-3 min-h-[80px]"
														style={{ 
															color: '#000000',
															fontSize: 16,
															lineHeight: 22,
															borderWidth: 0
														}}
														placeholderTextColor="#999999"
														editable={!isLoading}
														multiline
													/>
												) : (
													// Previous question - show answer
													<View className="px-3">
														<Text className="text-base leading-relaxed text-gray-800">
															{qa.answer || "No answer provided"}
														</Text>
													</View>
												)}
											</View>
										</Animated.View>
									);
								})}
							</Animated.View>
						</PanGestureHandler>

														{/* ✅ STEP 4: Fix Action Buttons - Always show during card phases */}
						{/* CHANGE: Remove the conditional check that hides buttons */}
						<View 
							className="flex-row justify-between items-center mb-3" 
							style={{ 
								marginTop: 12,
								// ✅ ADD: Ensure buttons stay above cards
								position: 'relative',
								zIndex: 1000 
							}}
						>
										{/* Examples Button */}
										<PrimaryButton
											onPress={() => {
												console.log("Examples button pressed");
												setInput("I'd like to explore this question further with some guidance.");
												handleSubmit({ preventDefault: () => {} } as any);
											}}
											className="py-3 px-6"
											style={{ height: 44 }}
											disabled={isLoading}
										>
											<Text className="font-medium text-base" style={{ color: '#000000' }}>
												Examples?
											</Text>
										</PrimaryButton>
										
										{/* Submit/Send Button */}
										<PrimaryButton
											onPress={() => {
												if (!input.trim() || isLoading) return;
												handleSubmit({ preventDefault: () => {} } as any);
											}}
											style={{ width: 44, height: 44 }}
											disabled={isLoading || !input.trim()}
										>
											<Text className="font-bold text-lg" style={{ color: '#000000' }}>
												↗
											</Text>
										</PrimaryButton>
									</View>
					</View>
				)}

				{/* ✅ FIX: Replace ScrollView with View - content should not be scrollable */}
				<View style={{ paddingBottom: 20 }}>
					{/* Progress Scores - Always show */}
					<View className="mb-6">
						<ScoreWidgets scores={conversationState.scores} cardSlug={card.slug} />
					</View>

						{/* Synthesis Phase - Show Draft Statement */}
						{conversationState.step === "synthesis" && conversationState.draftStatement && (
							<View className="rounded-3xl p-4 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
								<Text className="text-lg font-medium mb-3 text-gray-800">
									Thanks — based on everything you've shared, here's a first draft of your brand purpose statement:
								</Text>
								
								<View className="rounded-2xl p-3 mb-4" style={{ backgroundColor: colors.surface }}>
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
							<View className="rounded-3xl p-4 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
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
											const newQuestion = "What aspects of the tone or style would you like to adjust?";
											setInput("I'd like to polish the tone and style of this statement.");
											setCurrentQuestion(newQuestion);
											setConversationState(prev => ({ 
												...prev, 
												step: "refinement",
												currentQuestion: newQuestion // ✅ FIX: Update conversation state
											}));
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
							<View className="rounded-3xl p-4 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
								<Text className="text-lg font-medium mb-3 text-gray-800">
									No problem! Which part doesn't feel quite right?
								</Text>
								
								<View className="gap-3">
									<Button
										onPress={() => {
											const newQuestion = "Tell me more about who you really serve. What's not quite right about how I described your audience?";
											setInput("The audience/who we serve doesn't feel quite right.");
											setCurrentQuestion(newQuestion);
											setConversationState(prev => ({ 
												...prev, 
												step: "refinement", 
												refinementArea: "audience",
												currentQuestion: newQuestion // ✅ FIX: Update conversation state
											}));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The who (audience)</Text>
									</Button>
									
									<Button
										onPress={() => {
											const newQuestion = "Help me understand better what you actually do or offer. What's missing or incorrect in my description?";
											setInput("What we do/offer doesn't feel quite right.");
											setCurrentQuestion(newQuestion);
											setConversationState(prev => ({ 
												...prev, 
												step: "refinement", 
												refinementArea: "what",
												currentQuestion: newQuestion // ✅ FIX: Update conversation state
											}));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The what (what you do)</Text>
									</Button>
									
									<Button
										onPress={() => {
											const newQuestion = "What's the real reason you exist? What feels off about the 'why' I described?";
											setInput("The why/purpose doesn't feel quite right.");
											setCurrentQuestion(newQuestion);
											setConversationState(prev => ({ 
												...prev, 
												step: "refinement", 
												refinementArea: "why",
												currentQuestion: newQuestion // ✅ FIX: Update conversation state
											}));
										}}
										variant="white"
										className="py-3"
									>
										<Text className="font-medium">The why (purpose)</Text>
									</Button>
									
									<Button
										onPress={() => {
											const newQuestion = "What do you really believe? What values are most important to your brand that I might have missed?";
											setInput("The belief/values don't feel quite right.");
											setCurrentQuestion(newQuestion);
											setConversationState(prev => ({ 
												...prev, 
												step: "refinement", 
												refinementArea: "belief",
												currentQuestion: newQuestion // ✅ FIX: Update conversation state
											}));
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
								<View className="rounded-3xl p-4 mb-6" style={{ backgroundColor: colors.surface }}>
									<Title className="mb-4 text-center" style={{ color: colors.primary }}>Your Brand Purpose</Title>
									<View className="rounded-2xl p-3 mb-6" style={{ backgroundColor: '#000000' }}>
										<Text className="text-lg leading-relaxed text-center font-medium" style={{ color: colors.background }}>
											{conversationState.draftStatement || "No statement saved."}
										</Text>
									</View>
								</View>
								
								<View className="gap-3">
									<PrimaryButton
										onPress={() => {
											const newQuestion = "What aspects of your statement would you like to refine?";
											// Logic to refine statement
											setInput(conversationState.draftStatement || "");
											setCurrentQuestion(newQuestion);
											setConversationState(prev => ({ 
												...prev, 
												step: "refinement",
												currentQuestion: newQuestion // ✅ FIX: Update conversation state
											}));
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
				</View>
			</View>
			</AIErrorBoundary>
		</GestureHandlerRootView>
	);
}
