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
import { fetch as expoFetch } from "expo/fetch";
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

export function GuidedDiscovery({
	card,
	section,
	onComplete,
	onExit,
	educationalScore,
}: GuidedDiscoveryProps) {
	const { session } = useAuth();
	const [conversationState, setConversationState] = useState<ConversationState>({
		step: "opening",
		scores: { audience: 0, benefit: 0, belief: 0, impact: 0 },
	});
	const [isCompleted, setIsCompleted] = useState(false);
	const [showFallback, setShowFallback] = useState(false);

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
		return endpointMap[cardSlug] || "/api/chat";
	};

	const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
		api: getApiEndpoint(card.slug),
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		body: {
			userId: session?.user?.id,
		},
		initialMessages: [
			{
				id: 'initial',
				role: 'assistant',
				content: card.slug === 'purpose' 
					? "Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?"
					: `Let's discover your brand ${card.name.toLowerCase()}. Tell me about your brand and what makes it unique.`
			}
		],
		onFinish: async (message) => {
			// Look for completion indicators in AI response
			const content = message.content.toLowerCase();
			
			// Check if AI has generated a brand statement (synthesis step)
			if (content.includes("we exist to") || content.includes("brand purpose statement")) {
				const statementMatch = message.content.match(/"([^"]*we exist to[^"]*)"/i);
				if (statementMatch) {
					setConversationState(prev => ({
						...prev,
						step: "synthesis",
						draftStatement: statementMatch[1],
					}));
				}
			}
			
			// Check for completion phrases
			if (content.includes("perfect!") && content.includes("ready") || 
			    content.includes("congratulations") ||
			    content.includes("your brand purpose statement is complete")) {
				await handleCompletion();
			}

			// Save conversation state
			if (session?.user?.id) {
				try {
					await saveAIConversation(
						session.user.id,
						card.id,
						{ messages, conversationState },
						conversationState.step,
						isCompleted
					);
				} catch (error) {
					console.error("Error saving conversation:", error);
				}
			}
		},
		onError: (error) => {
			console.error("Chat error:", error);
			console.error("Error details:", {
				message: error.message,
				stack: error.stack,
				endpoint: getApiEndpoint(card.slug),
				userId: session?.user?.id
			});
			setShowFallback(true);
		},
	});

	// React Native compatible input handler
	const handleTextChange = (text: string) => {
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

	// Fallback opening question if AI SDK fails
	const fallbackQuestion = card.slug === 'purpose' 
		? "Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?"
		: `Let's discover your brand ${card.name.toLowerCase()}. Tell me about your brand and what makes it unique.`;

	const loadExistingConversation = async () => {
		if (!session?.user?.id) return;

		try {
			const { data, error } = await getAIConversation(session.user.id, card.id);
			if (data && !data.is_completed && data.conversation_data.messages) {
				// Restore previous conversation if it exists
				console.log("Loading existing conversation:", data);
			}
		} catch (error) {
			console.error("Error loading conversation:", error);
		}
	};

	const handleCompletion = async () => {
		if (!session?.user?.id || isCompleted) return;

		setIsCompleted(true);
		
		try {
			// Save brand statement if it exists
			if (conversationState.draftStatement) {
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
				true
			);

			console.log("Progress saved successfully for section:", section.id);

			// Delay before calling onComplete to show success message
			setTimeout(() => {
				onComplete();
			}, 2000);

		} catch (error) {
			console.error("Error saving completion:", error);
		}
	};

	// Calculate progress based on conversation length and AI responses
	const calculateProgress = () => {
		if (messages.length === 0) return 0;
		
		// Basic progress calculation based on conversation depth
		const userMessages = messages.filter(m => m.role === 'user').length;
		const hasStatement = conversationState.draftStatement;
		
		if (isCompleted) return 100;
		if (hasStatement) return 85;
		if (userMessages >= 4) return 70;
		if (userMessages >= 2) return 40;
		if (userMessages >= 1) return 20;
		return 0;
	};

	const progressPercentage = calculateProgress();

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
							: `Building your ${card.name.toLowerCase()} statement...`
						}
					</Text>
				</View>

				{/* Conversation */}
				<ScrollView className="flex-1 p-4">
					<View className="gap-4">
						{/* Progress Summary */}
						{progressPercentage > 0 && (
							<View className="bg-card rounded-xl p-4 border border-border">
								<Text className="font-semibold mb-2">Discovery Progress</Text>
								<Progress value={progressPercentage} max={100} showLabel={true} />
								<Text className="text-xs text-muted-foreground mt-2">
									{progressPercentage < 50 
										? "Getting to know your brand..." 
										: progressPercentage < 85
										? "Building your statement..."
										: "Almost there!"
									}
								</Text>
							</View>
						)}

						{/* Fallback Question - Show if AI SDK has errors or no messages */}
						{(showFallback || (messages.length === 0 && !isLoading)) && (
							<View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
								<Text className="whitespace-pre-wrap">{fallbackQuestion}</Text>
							</View>
						)}

						{/* Messages from AI SDK */}
						{!showFallback && messages.map((message, index) => (
							<View key={message.id || index} className="gap-2">
								{message.role === 'assistant' && (
									<View className="bg-primary/10 rounded-xl p-4 border border-primary/20">
										<Text className="whitespace-pre-wrap">{message.content}</Text>
									</View>
								)}
								{message.role === 'user' && (
									<View className="bg-card rounded-xl p-4 border border-border ml-8">
										<Text>{message.content}</Text>
									</View>
								)}
							</View>
						))}

						{/* Completion Message */}
						{isCompleted && (
							<View className="items-center py-4">
								<Text className="text-4xl mb-4">🎉</Text>
								<Text className="text-center font-semibold text-lg mb-2">
									Congratulations!
								</Text>
								<Text className="text-center text-muted-foreground">
									Your {card.name.toLowerCase()} discovery is complete. Moving to results...
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

								{isLoading && (
									<View className="items-center py-4">
										<Text className="text-sm text-muted-foreground mb-2">
											🤔 Analyzing your response...
										</Text>
									</View>
								)}

								<Button
									variant="default"
									size="lg"
									onPress={() => {
										if (showFallback) {
											// Handle fallback mode - could implement simple scoring here
											// For now, just show a completion message after a few responses
											const userResponse = input.toLowerCase().trim();
											if (userResponse.length > 20) {
												setIsCompleted(true);
												handleCompletion();
											}
										} else {
											// Check if the user is confirming completion
											const userResponse = input.toLowerCase().trim();
											if (conversationState.step === "synthesis" && 
											    (userResponse.includes("yes") || userResponse.includes("perfect") || 
											     userResponse.includes("looks good") || userResponse.includes("that's right"))) {
												handleCompletion();
											}
											
											// Call the original handleSubmit - React Native compatible
											try {
												const syntheticSubmitEvent = {
													preventDefault: () => {},
													target: { value: input },
													nativeEvent: { text: input },
													type: 'submit'
												} as any;
												handleSubmit(syntheticSubmitEvent);
											} catch (submitError) {
												console.error("Submit error:", submitError);
												setShowFallback(true);
											}
										}
									}}
									disabled={!input.trim() || isLoading}
								>
									<Text className="font-semibold">
										{isLoading ? "Processing..." : "Submit Response"}
									</Text>
								</Button>
							</View>
						)}

						{/* Error Display */}
						{error && !showFallback && (
							<View className="bg-destructive/10 rounded-xl p-4 border border-destructive/20">
								<Text className="text-destructive">
									AI temporarily unavailable. Using simplified mode.
								</Text>
							</View>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
