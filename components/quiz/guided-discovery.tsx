import { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Text } from "@/components/ui/text";
import { H2, H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/supabase-provider";
import { useChat } from "@ai-sdk/react";
import {
	saveAIConversation,
	getAIConversation,
	saveBrandPurposeStatement,
	updateUserProgress,
} from "@/lib/database-helpers";
import { Database } from "@/lib/database.types";

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
	}, []);

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

				// Look for completion indicators in AI response
				const content = message.content.toLowerCase();

				// Check if AI has generated a brand statement (synthesis step)
				if (
					content.includes("we exist to") ||
					content.includes("brand purpose statement")
				) {
					const statementMatch = message.content.match(
						/"([^"]*we exist to[^"]*)"/i,
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
					content.includes("your brand purpose statement is complete")
				) {
					debug.log("Completion Detected", {
						content: content.substring(0, 200),
					});
					await handleCompletion();
				}

				// Save conversation state
				if (session?.user?.id) {
					try {
						debug.log("Saving Conversation", {
							userId: session.user.id,
							cardId: card.id,
							step: conversationState.step,
							messageCount: messages.length,
						});

						await saveAIConversation(
							session.user.id,
							card.id,
							{ messages, conversationState },
							conversationState.step,
							isCompleted,
						);

						debug.log("Conversation Saved", "Successfully");
					} catch (error) {
						debug.error("Save Conversation Error", error);
					}
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
		if (!session?.user?.id) return;

		try {
			debug.log("Loading Existing Conversation", {
				userId: session.user.id,
				cardId: card.id,
			});

			const { data, error } = await getAIConversation(session.user.id, card.id);

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
		if (!session?.user?.id || isCompleted) return;

		debug.log("Handling Completion", {
			userId: session.user.id,
			hasStatement: !!conversationState.draftStatement,
			isAlreadyCompleted: isCompleted,
		});

		setIsCompleted(true);

		try {
			// Save brand statement if it exists
			if (conversationState.draftStatement) {
				debug.log("Saving Brand Statement", {
					statement: conversationState.draftStatement,
					scores: conversationState.scores,
				});

				await saveBrandPurposeStatement(
					session.user.id,
					conversationState.draftStatement,
					conversationState.scores.audience,
					conversationState.scores.benefit,
					conversationState.scores.belief,
					conversationState.scores.impact,
				);
			}

			// Update user progress - mark section as completed
			debug.log("Updating User Progress", {
				userId: session.user.id,
				cardId: card.id,
				sectionId: section.id,
			});

			await updateUserProgress(
				session.user.id,
				card.id,
				{
					status: "completed",
					completed_at: new Date().toISOString(),
				},
				section.id,
			);

			// Mark conversation as completed
			await saveAIConversation(
				session.user.id,
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
						<Button variant="ghost" size="sm" onPress={onExit}>
							<Text className="text-lg">✕</Text>
						</Button>

						<View className="items-center">
							<H3 className="text-center font-bold">{card.name}</H3>
							<Text className="text-sm text-muted-foreground">
								Discover your {card.name.toLowerCase()}
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

					<Text className="text-center text-sm text-muted-foreground mt-2">
						{isCompleted
							? "🎉 Discovery complete!"
							: conversationState.draftStatement
								? "Review your statement..."
								: `Building your ${card.name.toLowerCase()} statement...`}
					</Text>
				</View>

				{/* Conversation */}
				<ScrollView className="flex-1 p-4">
					<View className="gap-4">
						{/* Debug Info Panel - Only in development */}
						{__DEV__ && (
							<View className="bg-yellow-100 rounded-xl p-4 border border-yellow-300">
								<Text className="font-semibold mb-2 text-yellow-800">
									🤖 AI SDK Debug
								</Text>
								<Text className="text-xs text-yellow-700">
									Loading: {isLoading ? "YES" : "NO"} | Messages:{" "}
									{messages.length} | AI Only Mode: ACTIVE
								</Text>
								<Text className="text-xs text-yellow-700 mt-1">
									Endpoint: {getApiEndpoint(card.slug)} | Step:{" "}
									{conversationState.step}
								</Text>
							</View>
						)}

						{/* Progress Summary */}
						{progressPercentage > 0 && (
							<View className="bg-card rounded-xl p-4 border border-border">
								<Text className="font-semibold mb-2">Discovery Progress</Text>
								<Progress
									value={progressPercentage}
									max={100}
									showLabel={true}
								/>
								<Text className="text-xs text-muted-foreground mt-2">
									{progressPercentage < 50
										? "Getting to know your brand..."
										: progressPercentage < 85
											? "Building your statement..."
											: "Almost there!"}
								</Text>
							</View>
						)}

						{/* Messages from AI SDK */}
						{messages.map((message, index) => (
							<View key={message.id || index} className="gap-2">
								{message.role === "assistant" && (
									<View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
										<Text className="whitespace-pre-wrap">
											{message.content}
										</Text>
									</View>
								)}
								{message.role === "user" && (
									<View className="bg-card rounded-xl p-4 border border-border ml-8">
										<Text>{message.content}</Text>
									</View>
								)}
							</View>
						))}

						{/* Loading State */}
						{isLoading && (
							<View className="items-center py-4">
								<Text className="text-sm text-muted-foreground mb-2">
									🤔 AI is analyzing your response...
								</Text>
								<Text className="text-xs text-muted-foreground">
									Powered by OpenAI GPT-4
								</Text>
							</View>
						)}

						{/* Completion Message */}
						{isCompleted && (
							<View className="items-center py-4">
								<Text className="text-4xl mb-4">🎉</Text>
								<Text className="text-center font-semibold text-lg mb-2">
									Congratulations!
								</Text>
								<Text className="text-center text-muted-foreground">
									Your {card.name.toLowerCase()} discovery is complete. Moving
									to results...
								</Text>
							</View>
						)}

						{/* Input Form */}
						{!isCompleted && (
							<View className="gap-3">
								<Textarea
									placeholder="Share your thoughts..."
									value={input}
									onChangeText={handleTextChange}
									className="min-h-24"
									multiline
									textAlignVertical="top"
								/>

								<Button
									variant="default"
									size="lg"
									onPress={handleEnhancedSubmit}
									disabled={!input.trim() || isLoading}
								>
									<Text className="font-semibold">
										{isLoading ? "AI Processing..." : "Submit Response"}
									</Text>
								</Button>
							</View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
