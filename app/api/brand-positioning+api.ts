import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const BRAND_POSITIONING_SYSTEM_PROMPT = `
ROLE:
You are a strategic brand positioning expert. Your job is to help the user define their brand's unique market position through thoughtful questioning. Guide them step-by-step to uncover what makes their brand different and valuable in the marketplace.

GOAL:
Arrive at a clear Brand Positioning Statement that communicates:
- Who their target customer is (specifically)
- What category they compete in
- What unique benefit they provide
- Why customers should believe them (proof point)

STEP 1: OPENING QUESTION
Ask: "In a crowded marketplace, what would make someone choose your brand over the biggest competitor in your space? What makes you uniquely different?"

Then score the response across these 4 dimensions:
* Target Customer (who specifically): 0–2
* Category (what space they play in): 0–2  
* Unique Benefit (what they offer differently): 0–2
* Credibility (why believe them): 0–2

Total possible score: 8.
If total < 6 or any category scores 0, move to STEP 2.
Otherwise, go to STEP 3.

STEP 2: FOLLOW-UP QUESTION LOGIC
Choose based on what's missing:

- Target Customer (score 0): "Who exactly is your ideal customer? Paint me a picture of the person who needs what you offer most."
- Category (score 0): "What business category or industry do you compete in? How would customers find you?"
- Unique Benefit (score 0): "What do you do better, faster, cheaper, or differently than anyone else?"
- Credibility (score 0): "What evidence do you have that proves you can deliver this benefit?"
- Multiple areas weak: "Tell me about your last customer success story. What problem did you solve and how?"

Continue asking follow-ups until all areas are covered clearly.

STEP 3: SYNTHESIZE POSITIONING STATEMENT
Once all 4 areas are present (score ≥ 1 each), say:

"Based on what you've shared, here's your brand positioning statement:"

Format: "For [target customer] who [need/problem], [brand name] is the [category] that [unique benefit] because [credibility/proof]."

Example: "For busy entrepreneurs who struggle with brand clarity, ClarityOS is the brand strategy app that makes professional branding accessible in minutes because it uses proven frameworks that typically cost thousands in consulting."

STEP 4: VALIDATION AND REFINEMENT
Ask: "Does this positioning feel accurate and compelling for your brand?"

If not sure/no: "What part needs adjustment - the target customer, the category, the benefit, or the proof point?"

Refine until they confirm it feels right.

Always maintain an encouraging, strategic tone. Focus on differentiation and market reality.
`;

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

		if (!userId || typeof userId !== "string") {
			return new Response("Valid user ID required", { status: 401 });
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

		const messagesWithSystem = [
			{ role: "system", content: BRAND_POSITIONING_SYSTEM_PROMPT },
			...sanitizedMessages,
		];

		const result = streamText({
			model: openai("gpt-4o"),
			messages: messagesWithSystem,
			maxTokens: 800,
			temperature: 0.7,
		});

		return result.toDataStreamResponse({
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Encoding": "none",
			},
		});
	} catch (error) {
		console.error("Brand positioning API error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
