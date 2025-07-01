import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Subtitle, Title } from "../ui/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../../context/supabase-provider";
import { useChat } from "@ai-sdk/react";
import { ProgressManager } from "../../lib/progress-manager";
import { LocalAIStorage } from "../../lib/local-storage";
import { Database } from "../../lib/database.types";
import { AIErrorBoundary } from "../ai-error-boundary";

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
	step: "opening" | "follow_up" | "synthesis" | "validation" | "complete";
	scores: {
		audience: number;
		benefit: number;
		belief: number;
		impact: number;
	};
	draftStatement?: string;
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
		<View className="flex-row flex-wrap gap-3">
			{scoreItems.map((item) => (
				<View 
					key={item.key}
					className="flex-1 min-w-[45%] bg-gray-800 rounded-2xl p-4"
					style={{ minWidth: '45%' }}
				>
					{/* Score indicator */}
					<View className="flex-row items-center gap-1 mb-2">
						{[...Array(maxScore)].map((_, index) => (
							<View
								key={index}
								className={`w-2 h-2 rounded-full ${
									index < item.score ? 'bg-green-400' : 'bg-gray-600'
								}`}
							/>
						))}
					</View>
					
					{/* Label */}
					<Text className="text-white text-sm font-medium leading-tight">
						{item.label}
					</Text>
				</View>
			))}
		</View>
	);
}

// Debugging utility
const debug = {
	log: (tag: string, data: any) => {
		console.log(`[GuidedDiscovery:${tag}]`, data);
	},
	error: (tag: string, error: any) => {
		console.error(`[GuidedDiscovery:${tag}]`, error);
	},
	warn: (tag: string, data: any) => {
		console.warn(`[GuidedDiscovery:${tag}]`, data);
	},
};

export function GuidedDiscovery({
	card,
	section,
	onComplete,
	onExit,
	educationalScore,
}: GuidedDiscoveryProps) {
	const { session } = useAuth();
	const [conversationState, setConversationState] = useState<ConversationState>(
		{
			step: "opening",
			scores: { audience: 0, benefit: 0, belief: 0, impact: 0 },
		},
	);
	const [isCompleted, setIsCompleted] = useState(false);
	const [debugInfo, setDebugInfo] = useState<any>({});
	const [currentQuestion, setCurrentQuestion] = useState<string>("");
	const [isInitialized, setIsInitialized] = useState(false);

	// ✅ Generate anonymous user ID for unauthenticated users
	const [anonymousUserId] = useState(() => 
		`anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	);
	
	// ✅ Use authenticated user ID or anonymous ID
	const effectiveUserId = session?.user?.id || anonymousUserId;
	const isAuthenticated = !!session?.user?.id;

	// ✅ Ref to track if completion is in progress to prevent double triggers
	const completionInProgress = useRef(false);

	// Helper function to extract scores from AI response
	const extractScoresFromResponse = (content: string) => {
		const scores = { audience: 0, benefit: 0, belief: 0, impact: 0 };
		
		// Look for explicit scoring patterns in AI response
		// The AI might mention scores like "Audience: 1, Benefit: 2" etc.
		const scorePatterns = [
			/audience[:\s]*(\d)/i,
			/benefit[:\s]*(\d)/i, 
			/belief[:\s]*(\d)/i,
			/impact[:\s]*(\d)/i
		];

		const scoreKeys = ['audience', 'benefit', 'belief', 'impact'] as const;
		
		scorePatterns.forEach((pattern, index) => {
			const match = content.match(pattern);
			if (match) {
				const score = parseInt(match[1]);
				if (score >= 0 && score <= 2) {
					scores[scoreKeys[index]] = score;
				}
			}
		});

		// Intelligent scoring based on content analysis if no explicit scores found
		if (Object.values(scores).every(score => score === 0)) {
			// Analyze content for implicit scoring indicators
			const lowerContent = content.toLowerCase();
			
			// Audience scoring - look for mentions of specific targets
			if (lowerContent.includes('customer') || lowerContent.includes('audience') || 
				lowerContent.includes('target') || lowerContent.includes('who')) {
				scores.audience = lowerContent.includes('specific') || lowerContent.includes('exactly') ? 2 : 1;
			}
			
			// Benefit scoring - look for value propositions
			if (lowerContent.includes('help') || lowerContent.includes('benefit') || 
				lowerContent.includes('solve') || lowerContent.includes('provide')) {
				scores.benefit = lowerContent.includes('clearly') || lowerContent.includes('specifically') ? 2 : 1;
			}
			
			// Belief scoring - look for values/principles
			if (lowerContent.includes('believe') || lowerContent.includes('value') || 
				lowerContent.includes('stand for') || lowerContent.includes('principle')) {
				scores.belief = lowerContent.includes('strongly') || lowerContent.includes('core') ? 2 : 1;
			}
			
			// Impact scoring - look for transformation/change
			if (lowerContent.includes('impact') || lowerContent.includes('change') || 
				lowerContent.includes('transform') || lowerContent.includes('difference')) {
				scores.impact = lowerContent.includes('significant') || lowerContent.includes('major') ? 2 : 1;
			}
		}

		return scores;
	};

	// Helper function to get example text based on card type
	const getExampleText = (cardSlug: string) => {
		const examples = {
			purpose: "E.g., 'Our customers would miss our eco-friendly packaging because it helps them live sustainably.'",
			positioning: "E.g., 'We're the only platform that combines AI analytics with human insight for small businesses.'",
			personality: "E.g., 'Our brand is like a trusted friend - approachable, reliable, and always honest.'",
			"product-market-fit": "E.g., 'Small business owners struggle with data analysis, and our simple dashboard solves this perfectly.'",
			perception: "E.g., 'Customers see us as the premium, environmentally conscious choice in our market.'",
			presentation: "E.g., 'Our visual identity uses earth tones and clean typography to convey sustainability and trust.'",
			proof: "E.g., 'We've helped 500+ businesses reduce their carbon footprint by 30% on average.'"
		};
		return examples[cardSlug as keyof typeof examples] || "Share your thoughts here...";
	};

	// Helper function to extract questions from AI responses
	const extractQuestionFromContent = (content: string) => {
		// Look for questions in the content
		const sentences = content.split(/[.!]\s+/);
		const questionSentence = sentences.find(sentence => sentence.includes('?'));
		
		if (questionSentence) {
			return questionSentence.trim();
		}
		
		// Fallback: look for imperative statements that might be questions
		const imperatives = sentences.find(sentence => 
			sentence.toLowerCase().includes('tell me') ||
			sentence.toLowerCase().includes('describe') ||
			sentence.toLowerCase().includes('explain') ||
			sentence.toLowerCase().includes('what') ||
			sentence.toLowerCase().includes('how') ||
			sentence.toLowerCase().includes('why')
		);
		
		return imperatives?.trim() || content.substring(0, 200) + (content.length > 200 ? '...' : '');
	};

	// Initial debug logging
	useEffect(() => {
		debug.log("Component Initialized", {
			cardSlug: card.slug,
			sectionId: section.id,
			userId: session?.user?.id,
			educationalScore,
			timestamp: new Date().toISOString(),
		});

		// Check environment variables (removed API key check for security)
		debug.log("Environment Check", {
			nodeEnv: process.env.NODE_ENV,
			platform: Platform.OS,
		});

		// Set initial question
		setCurrentQuestion(
			card.slug === "purpose"
				? "Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?"
				: `Tell me about your brand and what makes it unique in the ${card.name.toLowerCase()} space.`
		);

		setIsInitialized(true);
	}, [card]);

	// Get the appropriate API endpoint based on card slug
	const getApiEndpoint = (cardSlug: string) => {
		const endpointMap: { [key: string]: string } = {
			purpose: "/api/brand-purpose",
			positioning: "/api/brand-positioning",
			personality: "/api/brand-personality",
			"product-market-fit": "/api/product-market-fit",
			perception: "/api/brand-perception",
			presentation: "/api/brand-presentation",
			proof: "/api/brand-proof",
		};
		const endpoint = endpointMap[cardSlug] || "/api/chat";

		debug.log("API Endpoint", {
			cardSlug,
			endpoint,
			available: Object.keys(endpointMap),
		});

		return endpoint;
	};

	// ✅ Save conversation state to appropriate storage
	const saveConversationState = async () => {
		try {
			if (isAuthenticated) {
				// Save to database via ProgressManager
				const progressManager = new ProgressManager(session);
				await progressManager.saveAIConversation(
					card.id,
					{ messages, conversationState },
					conversationState.step,
					isCompleted,
				);
				debug.log("Conversation Saved to Database", "Successfully");
			} else {
				// Save to local storage
				await LocalAIStorage.saveConversation(
					card.id,
					{ messages, conversationState },
					conversationState.step,
					isCompleted
				);
				debug.log("Conversation Saved Locally", "Successfully");
			}
		} catch (error) {
			debug.error("Save Conversation Error", error);
		}
	};

	const { messages, input, handleInputChange, handleSubmit, isLoading, error, append, setInput } =
		useChat({
			api: getApiEndpoint(card.slug),
			body: {
				userId: effectiveUserId, // ✅ Always send a user ID
			},
			initialMessages: [
				{
					id: "initial",
					role: "assistant",
					content:
						card.slug === "purpose"
							? "Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?"
							: `Let's discover your brand ${card.name.toLowerCase()}. Tell me about your brand and what makes it unique.`,
				},
			],
			headers: {
				"Content-Type": "application/json",
			},
			onFinish: async (message) => {
				debug.log("🤖 AI Response Received", {
					messageId: message.id,
					role: message.role,
					contentLength: message.content.length,
					contentPreview: message.content.substring(0, 100) + "...",
					timestamp: new Date().toISOString(),
				});

				// Extract scores from AI response
				const extractedScores = extractScoresFromResponse(message.content);
				debug.log("📊 Scores Extracted", extractedScores);

				// Extract the next question from AI response
				const extractedQuestion = extractQuestionFromContent(message.content);
				
				// Check if AI has generated a brand statement (synthesis step)
				const content = message.content.toLowerCase();
				const statementMatch = message.content.match(
					/"([^"]*(?:we exist to|purpose|statement)[^"]*)"/i,
				);

				// ✅ FIXED: Single batched state update to prevent race conditions
				setConversationState((prev) => {
					const newState = { ...prev };
					
					// Update scores (additive approach)
					newState.scores = {
						audience: Math.max(prev.scores.audience, extractedScores.audience),
						benefit: Math.max(prev.scores.benefit, extractedScores.benefit),
						belief: Math.max(prev.scores.belief, extractedScores.belief),
						impact: Math.max(prev.scores.impact, extractedScores.impact),
					};

					// Update step and statement if detected
					if (
						content.includes("we exist to") ||
						content.includes("brand purpose statement") ||
						content.includes("brand statement") ||
						content.includes("here's your")
					) {
						if (statementMatch) {
							debug.log("Statement Detected", {
								statement: statementMatch[1],
								step: "synthesis",
							});

							newState.step = "synthesis";
							newState.draftStatement = statementMatch[1];
						}
					}

					return newState;
				});

				// Update current question if extracted and different
				if (extractedQuestion && extractedQuestion !== currentQuestion) {
					setCurrentQuestion(extractedQuestion);
					debug.log("Question Updated", { newQuestion: extractedQuestion });
				}

				// ✅ FIXED: Delay completion detection to let state updates complete
				if (
					(content.includes("perfect!") && content.includes("ready")) ||
					content.includes("congratulations") ||
					content.includes("your brand purpose statement is complete") ||
					content.includes("discovery is complete")
				) {
					debug.log("Completion Detected", {
						content: content.substring(0, 200),
					});
					
					// ✅ Small delay to ensure state updates are processed
					setTimeout(async () => {
						if (!completionInProgress.current) {
							await handleCompletion();
						}
					}, 200);
				}
			},
			onError: (error) => {
				debug.error("❌ useChat Error", {
					message: error.message,
					stack: error.stack,
					endpoint: getApiEndpoint(card.slug),
					userId: effectiveUserId,
					timestamp: new Date().toISOString(),
				});

				// Log error but don't throw - let useChat handle it gracefully
				console.error("Chat API Error:", error.message);
			},
		});

	// ✅ Add intensive debugging for useChat state changes
	useEffect(() => {
		debug.log("🔄 useChat State Update", {
			isLoading,
			messageCount: messages.length,
			inputLength: input.length,
			hasError: !!error,
			errorMessage: error?.message,
			lastMessage: messages[messages.length - 1]?.content?.substring(0, 50),
			timestamp: new Date().toISOString(),
		});
	}, [isLoading, messages, input, error]);

	// ✅ FIXED: Use useEffect to save conversation state when it changes
	useEffect(() => {
		if (isInitialized && messages.length > 0) {
			debug.log("💾 Saving Conversation State", {
				messageCount: messages.length,
				conversationStep: conversationState.step,
				isCompleted,
				isAuthenticated,
				timestamp: new Date().toISOString()
			});
			
			// Small delay to ensure all state updates are complete
			const saveTimeout = setTimeout(() => {
				saveConversationState();
			}, 100);
			
			return () => clearTimeout(saveTimeout);
		}
	}, [conversationState, messages, isCompleted, isInitialized]);

	// React Native compatible input handler - use setInput directly
	const handleTextChange = (text: string) => {
		const debugData = { 
			textLength: text.length, 
			text: text,
			previousInput: input,
			timestamp: new Date().toISOString()
		};
		debug.log("🔤 Input Changed", debugData);
		console.log("🔤 INPUT CHANGED:", debugData);
		
		// Use setInput directly instead of synthetic events - much more reliable in React Native
		setInput(text);
		console.log("✅ setInput called with:", text);
	};

	// Debug input state changes
	useEffect(() => {
		const debugData = { 
			input, 
			trimmed: input.trim(), 
			isEmpty: !input.trim(),
			shouldBeDisabled: !input.trim() || isLoading,
			isLoading,
			timestamp: new Date().toISOString()
		};
		debug.log("📝 Input State Changed", debugData);
		console.log("📝 INPUT STATE:", debugData);
	}, [input, isLoading]);

	// ✅ FIXED: Load existing conversation from appropriate storage with actual restoration
	const loadExistingConversation = async () => {
		try {
			if (isAuthenticated) {
				// Load from database
				const progressManager = new ProgressManager(session);
				const { data, error } = await progressManager.getAIConversation(card.id);

				if (error) {
					debug.error("Load Conversation Error", error);
					return;
				}

				if (data && !data.is_completed && data.conversation_data?.conversationState) {
					debug.log("Previous Database Conversation Found", {
						conversationId: data.id,
						step: data.current_step,
						isCompleted: data.is_completed,
						messageCount: data.conversation_data.messages?.length || 0,
					});
					
					// ✅ Actually restore conversation state
					setConversationState(data.conversation_data.conversationState);
					setIsCompleted(data.is_completed);
				}
			} else {
				// Load from local storage
				const localConversation = await LocalAIStorage.getConversation(card.id);
				
				if (localConversation && !localConversation.isCompleted && localConversation.conversationData?.conversationState) {
					debug.log("Previous Local Conversation Found", {
						conversationId: localConversation.id,
						step: localConversation.currentStep,
						isCompleted: localConversation.isCompleted,
						messageCount: localConversation.conversationData.messages?.length || 0,
					});
					
					// ✅ Actually restore conversation state
					setConversationState(localConversation.conversationData.conversationState);
					setIsCompleted(localConversation.isCompleted);
				}
			}
		} catch (error) {
			debug.error("Load Conversation Exception", error);
		}
	};

	// ✅ Load conversation on component mount
	useEffect(() => {
		if (isInitialized) {
			loadExistingConversation();
		}
	}, [isAuthenticated, card.id, isInitialized]);

	const handleCompletion = async () => {
		if (isCompleted || completionInProgress.current) return;

		// ✅ Prevent double completion
		completionInProgress.current = true;

		debug.log("Handling Completion", {
			userId: effectiveUserId,
			isAuthenticated,
			hasStatement: !!conversationState.draftStatement,
		});

		setIsCompleted(true);

		try {
			if (isAuthenticated) {
				// Save to database via ProgressManager
				const progressManager = new ProgressManager(session);

				// Save brand statement if it exists
				if (conversationState.draftStatement) {
					debug.log("Saving Brand Statement to Database", {
						statement: conversationState.draftStatement,
						scores: conversationState.scores,
					});

					await progressManager.saveBrandPurposeStatement(
						conversationState.draftStatement,
						conversationState.scores.audience,
						conversationState.scores.benefit,
						conversationState.scores.belief,
						conversationState.scores.impact,
					);
				}

				// Update user progress
				await progressManager.updateProgress(
					card.id,
					{
						status: "completed",
						completedAt: new Date().toISOString(),
					},
					section.id,
				);

				debug.log("Progress Saved to Database Successfully", { sectionId: section.id });
			} else {
				// Save to local storage
				if (conversationState.draftStatement) {
					debug.log("Saving Brand Statement Locally", {
						statement: conversationState.draftStatement,
						scores: conversationState.scores,
					});

					// Use ProgressManager which will save to local storage for unauthenticated users
					const progressManager = new ProgressManager(null);
					await progressManager.saveBrandPurposeStatement(
						conversationState.draftStatement,
						conversationState.scores.audience,
						conversationState.scores.benefit,
						conversationState.scores.belief,
						conversationState.scores.impact,
					);

					// Save progress locally
					await progressManager.updateProgress(
						card.id,
						{
							status: "completed",
							completedAt: new Date().toISOString(),
						},
						section.id,
					);
				}

				debug.log("Progress Saved Locally Successfully", { sectionId: section.id });
			}

		} catch (error) {
			debug.error("Completion Error", error);
		}

		// Show completion state and call onComplete
		setTimeout(() => {
			debug.log("Calling onComplete", "Starting completion callback");
			onComplete();
		}, 2000);
	};

	// Calculate progress based on conversation length and AI responses
	const calculateProgress = () => {
		if (messages.length === 0) return 0;

		// Basic progress calculation based on conversation depth
		const userMessages = messages.filter((m) => m.role === "user").length;
		const hasStatement = conversationState.draftStatement;

		if (isCompleted) return 100;
		if (hasStatement) return 85;
		if (userMessages >= 4) return 70;
		if (userMessages >= 2) return 40;
		if (userMessages >= 1) return 20;
		return 0;
	};

	const progressPercentage = calculateProgress();

	// ✅ FIXED: Enhanced submit handler with explicit input clearing
	const handleEnhancedSubmit = React.useCallback(async () => {
		// ✅ Add immediate debug log to track button presses
		const initialDebugData = {
			timestamp: new Date().toISOString(),
			input: input,
			inputTrimmed: input.trim(),
			inputLength: input.length,
			isLoading: isLoading,
			willProceed: !(!input.trim() || isLoading),
			conversationStep: conversationState.step,
			messageCount: messages.length
		};
		debug.log("🔥 Button Pressed!", initialDebugData);
		console.log("🔥 BUTTON PRESSED!", initialDebugData);
		
		if (!input.trim() || isLoading) {
			const blockDebugData = {
				reason: !input.trim() ? "Empty input" : "Already loading",
				input: input,
				inputTrimmed: input.trim(),
				isLoading: isLoading,
				timestamp: new Date().toISOString()
			};
			debug.log("⛔ Submit Blocked", blockDebugData);
			console.log("⛔ SUBMIT BLOCKED:", blockDebugData);
			return;
		}

		const proceedDebugData = {
			inputLength: input.length,
			isLoading,
			endpoint: getApiEndpoint(card.slug),
			userId: effectiveUserId,
			timestamp: new Date().toISOString()
		};
		debug.log("✅ Submit Proceeding", proceedDebugData);
		console.log("✅ SUBMIT PROCEEDING:", proceedDebugData);

		// Check if the user is confirming completion
		const userResponse = input.toLowerCase().trim();
		if (
			conversationState.step === "synthesis" &&
			(userResponse.includes("yes") ||
				userResponse.includes("perfect") ||
				userResponse.includes("looks good") ||
				userResponse.includes("that's right"))
		) {
			debug.log("🎉 User Confirmed Completion", "User accepted the statement");
			console.log("🎉 USER CONFIRMED COMPLETION");
			// ✅ Clear input before completion
			setInput("");
			handleCompletion();
			return;
		}

		// ✅ Store input value before clearing it
		const currentInput = input;

		try {
			const appendDebugData = {
				inputValue: currentInput,
				messageCount: messages.length,
				userId: effectiveUserId,
				endpoint: getApiEndpoint(card.slug),
				appendFunction: typeof append,
				timestamp: new Date().toISOString()
			};
			debug.log("📤 Calling append", appendDebugData);
			console.log("📤 CALLING APPEND:", appendDebugData);

			// ✅ Clear input immediately after storing it
			setInput("");
			debug.log("🧹 Input cleared", { newInput: "", timestamp: new Date().toISOString() });
			console.log("🧹 INPUT CLEARED");

			// Use the more reliable append method for programmatic message sending
			const appendResult = await append({
				role: "user",
				content: currentInput,
			});

			debug.log("✅ append Called Successfully", { 
				result: appendResult,
				timestamp: new Date().toISOString()
			});
			console.log("✅ APPEND SUCCESS:", appendResult);
		} catch (submitError) {
			// ✅ Restore input on error
			setInput(currentInput);
			
			const errorDebugData = {
				error: submitError,
				message: submitError instanceof Error ? submitError.message : "Unknown error",
				stack: submitError instanceof Error ? submitError.stack : undefined,
				inputRestored: currentInput,
				timestamp: new Date().toISOString()
			};
			debug.error("💥 Submit Error", errorDebugData);
			console.error("💥 SUBMIT ERROR:", errorDebugData);

			// Show user-friendly error message
			console.error("Failed to submit message:", submitError);
		}
	}, [input, isLoading, conversationState.step, append, setInput, effectiveUserId, card.slug, handleCompletion, messages.length]);

	// Throw error if there's an API error
	if (error) {
		throw new Error(
			`AI SDK Error: ${error.message}. Please check your OpenAI API key configuration and network connection.`,
		);
	}

	// ✅ INTENSIVE DEBUGGING: Track component renders and state
	debug.log("🔄 Component Render", {
		timestamp: new Date().toISOString(),
		input: input,
		inputTrimmed: input.trim(),
		inputLength: input.length,
		isLoading: isLoading,
		isCompleted: isCompleted,
		conversationStep: conversationState.step,
		messageCount: messages.length,
		isAuthenticated: isAuthenticated,
		effectiveUserId: effectiveUserId,
		buttonShouldBeDisabled: !input.trim() || isLoading,
		buttonShouldBeGreen: input.trim() && !isLoading,
		handlerExists: typeof handleEnhancedSubmit === 'function'
	});

	console.log("🔄 COMPONENT RENDER:", {
		input: input.substring(0, 50),
		inputLength: input.length,
		isLoading: isLoading,
		buttonDisabled: !input.trim() || isLoading,
		messageCount: messages.length
	});

	return (
		<AIErrorBoundary>
			<SafeAreaView className="flex-1 bg-background">
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
				{/* Header */}
				<View className="p-4 border-b border-border">
					<View className="flex-row justify-between items-center mb-3">
						<Button variant="white" size="sm" onPress={onExit}>
							<Text className="text-lg">✕</Text>
						</Button>

						<View className="items-center">
							<Title className="text-center font-bold">{card.name}</Title>
							<Text className="text-sm text-muted-foreground">
								Discovery Session
							</Text>
						</View>

						<View className="w-8" />
					</View>

					<Progress
						value={progressPercentage}
						max={100}
						showLabel={false}
						className="h-3"
						variant="default"
					/>
				</View>

				{/* Main Content */}
				<ScrollView className="flex-1 p-4">
					<View className="gap-6">
						{/* ✅ Anonymous User Notice */}
						{!isAuthenticated && (
							<View className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
								<View className="flex-row items-center gap-3">
									<Text className="text-2xl">💡</Text>
									<View className="flex-1">
										<Text className="text-blue-800 font-semibold text-sm">
											You're trying this anonymously
										</Text>
										<Text className="text-blue-600 text-xs mt-1">
											Your progress is saved locally. Sign up to sync across devices!
										</Text>
									</View>
								</View>
							</View>
						)}

						{/* Debug Info Panel - Only in development */}
						{__DEV__ && (
							<View className="bg-yellow-100 rounded-xl p-4 border border-yellow-300">
								<Text className="font-semibold mb-2 text-yellow-800">
									🤖 AI SDK Debug
								</Text>
								<Text className="text-xs text-yellow-700">
									Loading: {isLoading ? "YES" : "NO"} | Messages:{" "}
									{messages.length} | Current Question: {currentQuestion.substring(0, 50)}...
								</Text>
								<Text className="text-xs text-yellow-700 mt-1">
									Endpoint: {getApiEndpoint(card.slug)} | Step:{" "}
									{conversationState.step} | Scores: {JSON.stringify(conversationState.scores)} | Auth: {isAuthenticated ? "YES" : "NO"}
								</Text>
							</View>
						)}

						{/* Question Card */}
						<View 
							className="bg-card rounded-3xl p-6 border border-border" 
							style={{ 
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.1,
								shadowRadius: 12,
								elevation: 3,
							}}
						>
							{/* Question Text */}
							<Text className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
								{currentQuestion}
							</Text>

							{/* Input Area */}
							<View className="gap-4">
								<Textarea
									placeholder={getExampleText(card.slug)}
									value={input}
									onChangeText={(text) => {
										const textareaDebugData = {
											timestamp: new Date().toISOString(),
											newText: text,
											newTextLength: text.length,
											newTextTrimmed: text.trim(),
											previousInput: input,
											handlerType: typeof handleTextChange
										};
										debug.log("📝 Textarea onChangeText Called", textareaDebugData);
										console.log("📝 TEXTAREA CHANGE:", textareaDebugData);
										handleTextChange(text);
									}}
									className="min-h-32 text-base leading-relaxed border-2"
									multiline
									textAlignVertical="top"
									style={{
										borderRadius: 16,
										borderColor: input.trim() ? '#9AFF9A' : '#E5E7EB',
										backgroundColor: '#FFFFFF',
										padding: 16,
									}}
								/>

								{/* ✅ TOUCH TEST: Simple touch test button */}
								<Pressable
									onPress={() => {
										console.log("🧪 TOUCH TEST BUTTON PRESSED!");
										debug.log("🧪 Touch Test", { timestamp: new Date().toISOString() });
									}}
									style={{
										backgroundColor: '#FF6B6B',
										padding: 12,
										borderRadius: 8,
										alignItems: 'center' as const,
										marginBottom: 8,
									}}
								>
									<Text style={{ color: 'white', fontWeight: '600' }}>
										🧪 Touch Test (Click Me)
									</Text>
								</Pressable>

								{/* ✅ FIXED: Direct Pressable Button with Intensive Debugging */}
								<Pressable
									onPress={() => {
										const debugData = {
											timestamp: new Date().toISOString(),
											input: input,
											inputTrimmed: input.trim(),
											isLoading: isLoading,
											handlerType: typeof handleEnhancedSubmit
										};
										debug.log("🖱️ Pressable onPress Called!", debugData);
										console.log("🖱️ PRESSABLE PRESS DEBUG:", debugData);
										console.log("🚀 ABOUT TO CALL handleEnhancedSubmit");
										handleEnhancedSubmit();
									}}
									onPressIn={() => {
										console.log("👇 PRESS IN - Button touched");
										debug.log("👇 Button Press In", { timestamp: new Date().toISOString() });
									}}
									onPressOut={() => {
										console.log("👆 PRESS OUT - Button released");
										debug.log("👆 Button Press Out", { timestamp: new Date().toISOString() });
									}}
									disabled={(() => {
										const isDisabled = !input.trim() || isLoading;
										debug.log("🔒 Pressable Disabled Check", {
											isDisabled,
											inputEmpty: !input.trim(),
											isLoading,
											input: input,
											inputTrimmed: input.trim()
										});
										console.log("🔒 PRESSABLE DISABLED:", isDisabled, "input:", input, "isLoading:", isLoading);
										return isDisabled;
									})()}
									style={({ pressed }) => {
										const baseStyle = {
											borderRadius: 24,
											paddingVertical: 16,
											paddingHorizontal: 32,
											alignItems: 'center' as const,
											justifyContent: 'center' as const,
											minHeight: 56,
										};
										
										const enabledStyle = input.trim() && !isLoading ? {
											backgroundColor: pressed ? '#8AEF8A' : '#9AFF9A', // Slightly darker when pressed
										} : {
											backgroundColor: '#E5E7EB',
										};
										
										console.log("🎨 BUTTON STYLE:", { pressed, enabled: input.trim() && !isLoading });
										
										return { ...baseStyle, ...enabledStyle };
									}}
								>
									<Text style={{ 
										fontWeight: '600',
										fontSize: 16,
										color: input.trim() && !isLoading ? '#000000' : '#9CA3AF'
									}}>
										{isLoading ? "Processing..." : "Continue"}
									</Text>
								</Pressable>
							</View>
						</View>

						{/* Progress Indicator */}
						{messages.length > 2 && !isCompleted && (
							<View className="bg-card rounded-3xl p-4 border border-border">
								<Text className="font-semibold mb-3 text-center">
									Building Your {card.name}
								</Text>
								<View className="flex-row justify-center gap-2 mb-3">
									{[1,2,3,4,5].map((step) => (
										<View
											key={step}
											className={`w-3 h-3 rounded-full ${
												step <= Math.floor(progressPercentage / 20)
													? 'bg-green-400'
													: 'bg-gray-200'
											}`}
										/>
									))}
								</View>
								<Text className="text-xs text-muted-foreground text-center">
									{progressPercentage < 50
										? "Exploring your brand..."
										: progressPercentage < 85
											? "Crafting your statement..."
											: "Almost complete!"}
								</Text>
							</View>
						)}

						{/* AI Thinking Indicator */}
						{isLoading && (
							<View className="bg-card rounded-3xl p-6 border border-border">
								<View className="flex-row items-center justify-center gap-3">
									<View className="flex-row gap-1">
										{[0,1,2].map((i) => (
											<View
												key={i}
												className="w-2 h-2 bg-green-400 rounded-full"
												style={{
													opacity: 0.4 + (i * 0.2),
												}}
											/>
										))}
									</View>
									<Text className="text-muted-foreground">
										AI is analyzing your response...
									</Text>
								</View>
							</View>
						)}

						{/* Completion State */}
						{isCompleted && (
							<View className="bg-card rounded-3xl p-8 border border-border items-center">
								<Text className="text-4xl mb-4">🎉</Text>
								<Text className="text-center font-bold text-xl mb-2">
									Discovery Complete!
								</Text>
								<Text className="text-center text-muted-foreground mb-4">
									Your {card.name.toLowerCase()} has been crafted successfully.
								</Text>
								<Button
									variant="white"
									size="lg"
									onPress={onComplete}
									style={{
										backgroundColor: '#9AFF9A',
										borderRadius: 24,
									}}
								>
									<Text className="font-semibold text-black">
										View Results
									</Text>
								</Button>
							</View>
						)}

						{/* Score Widgets - Replace Tips Card */}
						{!isCompleted && messages.length > 1 && (
							<ScoreWidgets scores={conversationState.scores} cardSlug={card.slug} />
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
		</AIErrorBoundary>
	);
}
