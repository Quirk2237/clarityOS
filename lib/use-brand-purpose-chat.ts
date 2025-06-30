import { useChat } from "@ai-sdk/react";
import { useState } from "react";

interface BrandPurposeSession {
	id: string;
	userId: string;
	progress: "opening" | "follow_up" | "synthesis" | "refinement" | "complete";
	purposeStatement?: string;
	scores?: {
		audience: number;
		benefit: number;
		belief: number;
		impact: number;
	};
}

export function useBrandPurposeChat() {
	const [session, setSession] = useState<BrandPurposeSession | null>(null);

	const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
		useChat({
			api: "/api/brand-purpose",
			onFinish: (message) => {
				// Extract purpose statement if generated
				if (message.content.includes("We exist to")) {
					const match = message.content.match(/"(We exist to[^"]+)"/);
					if (match) {
						setSession((prev) =>
							prev
								? {
										...prev,
										purposeStatement: match[1],
										progress: "refinement",
									}
								: null,
						);
					}
				}
			},
		});

	const startSession = (userId: string) => {
		setSession({
			id: Date.now().toString(),
			userId,
			progress: "opening",
		});
	};

	const resetSession = () => {
		setSession(null);
	};

	const savePurposeStatement = async (statement: string) => {
		if (!session) return;

		// TODO: Save to Supabase database
		try {
			// This would integrate with your Supabase tables
			console.log("Saving purpose statement:", statement);
			setSession((prev) => (prev ? { ...prev, progress: "complete" } : null));
		} catch (error) {
			console.error("Error saving purpose statement:", error);
		}
	};

	return {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		isLoading,
		error,
		session,
		startSession,
		resetSession,
		savePurposeStatement,
	};
}
