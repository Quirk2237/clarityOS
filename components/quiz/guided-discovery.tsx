import * as React from "react";
import { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "../safe-area-view";
import { Text } from "../ui/text";
import { Subtitle, Title } from "../ui/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../../context/supabase-provider";
import { useChat } from "@ai-sdk/react";
import { ProgressManager } from "../../lib/progress-manager";
import { Database } from "../../lib/database.types";

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

	const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
		useChat({
			api: getApiEndpoint(card.slug),
			body: {
				userId: session?.user?.id,
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
				debug.log("AI Response Received", {
					messageId: message.id,
					role: message.role,
					contentLength: message.content.length,
					contentPreview: message.content.substring(0, 100) + "...",
					timestamp: new Date().toISOString(),
				});

				// Extract scores from AI response
				const extractedScores = extractScoresFromResponse(message.content);
				debug.log("Scores Extracted", extractedScores);

				// Update conversation state with new scores (additive approach)
				setConversationState((prev) => ({
					...prev,
					scores: {
						audience: Math.max(prev.scores.audience, extractedScores.audience),
						benefit: Math.max(prev.scores.benefit, extractedScores.benefit),
						belief: Math.max(prev.scores.belief, extractedScores.belief),
						impact: Math.max(prev.scores.impact, extractedScores.impact),
					}
				}));

				// Extract the next question from AI response
				const extractedQuestion = extractQuestionFromContent(message.content);
				if (extractedQuestion && extractedQuestion !== currentQuestion) {
					setCurrentQuestion(extractedQuestion);
					debug.log("Question Updated", { newQuestion: extractedQuestion });
				}

				// Look for completion indicators in AI response
				const content = message.content.toLowerCase();

				// Check if AI has generated a brand statement (synthesis step)
				if (
					content.includes("we exist to") ||
					content.includes("brand purpose statement") ||
					content.includes("brand statement") ||
					content.includes("here's your")
				) {
					const statementMatch = message.content.match(
						/"([^"]*(?:we exist to|purpose|statement)[^"]*)"/i,
					);
					if (statementMatch) {
						debug.log("Statement Detected", {
							statement: statementMatch[1],
							step: "synthesis",
						});

						setConversationState((prev) => ({
							...prev,
							step: "synthesis",
							draftStatement: statementMatch[1],
						}));
					}
				}

				// Check for completion phrases
				if (
					(content.includes("perfect!") && content.includes("ready")) ||
					content.includes("congratulations") ||
					content.includes("your brand purpose statement is complete") ||
					content.includes("discovery is complete")
				) {
					debug.log("Completion Detected", {
						content: content.substring(0, 200),
					});
					await handleCompletion();
				}

				// Save conversation state
				try {
					const progressManager = new ProgressManager(session);
					
					debug.log("Saving Conversation", {
						userId: session?.user?.id,
						cardId: card.id,
						step: conversationState.step,
						messageCount: messages.length,
					});

					await progressManager.saveAIConversation(
						card.id,
						{ messages, conversationState },
						conversationState.step,
						isCompleted,
					);

					debug.log("Conversation Saved", "Successfully");
				} catch (error) {
					debug.error("Save Conversation Error", error);
				}
			},
			onError: (error) => {
				debug.error("useChat Error", {
					message: error.message,
					stack: error.stack,
					endpoint: getApiEndpoint(card.slug),
					userId: session?.user?.id,
					timestamp: new Date().toISOString(),
				});

				// Log error but don't throw - let useChat handle it gracefully
				console.error("Chat API Error:", error.message);
			},
		});

	// Debug useChat state changes
	useEffect(() => {
		debug.log("useChat State Update", {
			isLoading,
			messageCount: messages.length,
			inputLength: input.length,
		});

		setDebugInfo((prev: any) => ({
			...prev,
			chatState: {
				isLoading,
				messageCount: messages.length,
				lastUpdate: new Date().toISOString(),
			},
		}));
	}, [isLoading, messages, input]);

	// React Native compatible input handler
	const handleTextChange = (text: string) => {
		debug.log("Input Changed", { textLength: text.length });

		// Create a synthetic event for the useChat hook that matches React Native patterns
		const syntheticEvent = {
			target: { value: text },
			nativeEvent: { text },
			preventDefault: () => {},
		} as any;
		handleInputChange(syntheticEvent);
	};

	useEffect(() => {
		if (session?.user?.id) {
			loadExistingConversation();
		}
	}, [session]);

	const loadExistingConversation = async () => {
		try {
			const progressManager = new ProgressManager(session);
			
			debug.log("Loading Existing Conversation", {
				userId: session?.user?.id,
				cardId: card.id,
			});

			const { data, error } = await progressManager.getAIConversation(card.id);

			if (error) {
				debug.error("Load Conversation Error", error);
				// Don't fail the component if we can't load existing conversation
				return;
			}

			if (data && !data.is_completed && data.conversation_data?.messages) {
				debug.log("Previous Conversation Found", {
					conversationId: data.id,
					step: data.current_step,
					isCompleted: data.is_completed,
					messageCount: data.conversation_data.messages.length,
				});

				// Could restore the conversation state here if needed
				// For now, we'll start fresh but could enhance this later
			} else {
				debug.log("No Previous Conversation", {
					hasData: !!data,
					isCompleted: data?.is_completed,
					hasMessages: !!data?.conversation_data?.messages,
				});
			}
		} catch (error) {
			debug.error("Load Conversation Exception", error);
			// Don't fail the component - just continue without loading previous conversation
		}
	};

	const handleCompletion = async () => {
		if (isCompleted) return;

		debug.log("Handling Completion", {
			userId: session?.user?.id,
			hasStatement: !!conversationState.draftStatement,
			isAlreadyCompleted: isCompleted,
		});

		setIsCompleted(true);

		try {
			const progressManager = new ProgressManager(session);

			// Save brand statement if it exists
			if (conversationState.draftStatement) {
				debug.log("Saving Brand Statement", {
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

			// Update user progress - mark section as completed
			debug.log("Updating User Progress", {
				userId: session?.user?.id,
				cardId: card.id,
				sectionId: section.id,
			});

			await progressManager.updateProgress(
				card.id,
				{
					status: "completed",
					completedAt: new Date().toISOString(),
				},
				section.id,
			);

			// Mark conversation as completed
			await progressManager.saveAIConversation(
				card.id,
				{ messages, conversationState },
				"complete",
				true,
			);

			debug.log("Progress Saved Successfully", { sectionId: section.id });

			// Delay before calling onComplete to show success message
			setTimeout(() => {
				debug.log("Calling onComplete", "Starting completion callback");
				onComplete();
			}, 2000);
		} catch (error) {
			debug.error("Completion Error", error);
		}
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

	// Enhanced submit handler with debugging
	const handleEnhancedSubmit = async () => {
		if (!input.trim() || isLoading) {
			debug.log("Submit Blocked", "Empty input or already loading");
			return;
		}

		debug.log("Submit Initiated", {
			inputLength: input.length,
			isLoading,
			endpoint: getApiEndpoint(card.slug),
		});

		// Check if the user is confirming completion
		const userResponse = input.toLowerCase().trim();
		if (
			conversationState.step === "synthesis" &&
			(userResponse.includes("yes") ||
				userResponse.includes("perfect") ||
				userResponse.includes("looks good") ||
				userResponse.includes("that's right"))
		) {
			debug.log("User Confirmed Completion", "User accepted the statement");
			handleCompletion();
			return;
		}

		// Call the original handleSubmit - React Native compatible
		try {
			debug.log("Calling handleSubmit", {
				inputValue: input,
				messageCount: messages.length,
				userId: session?.user?.id,
				endpoint: getApiEndpoint(card.slug),
			});

			// Create a proper synthetic event for React Native
			const syntheticEvent = {
				preventDefault: () => {},
				target: { value: input },
				currentTarget: { value: input },
				nativeEvent: { text: input },
				type: "submit",
			} as any;

			await handleSubmit(syntheticEvent);

			debug.log("handleSubmit Called", "Successfully completed");
		} catch (submitError) {
			debug.error("Submit Error", {
				error: submitError,
				message:
					submitError instanceof Error ? submitError.message : "Unknown error",
				stack: submitError instanceof Error ? submitError.stack : undefined,
			});

			// Re-throw the error instead of showing fallback
			throw new Error(
				`Failed to submit message: ${submitError instanceof Error ? submitError.message : "Unknown error"}`,
			);
		}
	};

	// Throw error if there's an API error
	if (error) {
		throw new Error(
			`AI SDK Error: ${error.message}. Please check your OpenAI API key configuration and network connection.`,
		);
	}

	return (
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
									{conversationState.step} | Scores: {JSON.stringify(conversationState.scores)}
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
									onChangeText={handleTextChange}
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

								{/* Submit Button */}
								<Button
									variant="white"
									size="lg"
									onPress={handleEnhancedSubmit}
									disabled={!input.trim() || isLoading}
									style={{
										backgroundColor: input.trim() && !isLoading ? '#9AFF9A' : 'rgba(255,255,255,0.3)',
										borderRadius: 24,
									}}
								>
									<Text className={`font-semibold ${input.trim() && !isLoading ? 'text-black' : 'text-gray-400'}`}>
										{isLoading ? "Processing..." : "Continue"}
									</Text>
								</Button>
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
	);
}
