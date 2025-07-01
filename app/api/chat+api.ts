import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Security constants
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_COUNT = 50;

export async function POST(req: Request) {
	try {
		const { messages, userId } = await req.json();

		// Input validation
		if (
			!messages ||
			!Array.isArray(messages) ||
			messages.length > MAX_MESSAGES_COUNT
		) {
			return new Response("Invalid messages format or too many messages", {
				status: 400,
			});
		}

		// ✅ Make userId optional - generate anonymous ID if needed
		let sessionUserId = userId;
		if (!sessionUserId || typeof sessionUserId !== "string") {
			// Generate anonymous session ID for rate limiting
			sessionUserId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		}

		// Sanitize inputs
		const sanitizedMessages = messages
			.map((msg) => ({
				...msg,
				content:
					typeof msg.content === "string"
						? msg.content.slice(0, MAX_MESSAGE_LENGTH).trim()
						: "",
				role:
					msg.role === "user" || msg.role === "assistant" ? msg.role : "user",
			}))
			.filter((msg) => msg.content.length > 0);

		if (sanitizedMessages.length === 0) {
			return new Response("No valid messages provided", { status: 400 });
		}

		const result = streamText({
			model: openai("gpt-4o"),
			messages: sanitizedMessages,
			maxTokens: 500,
			temperature: 0.7,
		});

		return result.toDataStreamResponse({
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Encoding": "none",
			},
		});
	} catch (error) {
		console.error("Chat API error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
