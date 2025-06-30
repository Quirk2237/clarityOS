// Security constants and utilities for AI API routes
export const SECURITY_CONSTANTS = {
	MAX_REQUESTS_PER_MINUTE: 10,
	MAX_MESSAGE_LENGTH: 2000,
	MAX_MESSAGES_COUNT: 50,
	MAX_RETRY_ATTEMPTS: 3,
	RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
};

// In-memory rate limiting store (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface SecurityValidationResult {
	isValid: boolean;
	error?: string;
	statusCode?: number;
}

export function validateRequest(
	messages: any,
	userId?: string,
): SecurityValidationResult {
	// Validate messages array
	if (!messages || !Array.isArray(messages)) {
		return {
			isValid: false,
			error: "Invalid messages format",
			statusCode: 400,
		};
	}

	if (messages.length > SECURITY_CONSTANTS.MAX_MESSAGES_COUNT) {
		return {
			isValid: false,
			error: "Too many messages in conversation",
			statusCode: 400,
		};
	}

	// Validate userId for brand discovery routes
	if (userId !== undefined && (!userId || typeof userId !== "string")) {
		return {
			isValid: false,
			error: "Valid user ID required",
			statusCode: 401,
		};
	}

	return { isValid: true };
}

export function sanitizeMessages(messages: any[]): any[] {
	return messages
		.map((msg) => ({
			...msg,
			content:
				typeof msg.content === "string"
					? msg.content.slice(0, SECURITY_CONSTANTS.MAX_MESSAGE_LENGTH).trim()
					: "",
			role: msg.role === "user" || msg.role === "assistant" ? msg.role : "user",
		}))
		.filter((msg) => msg.content.length > 0);
}

export function checkRateLimit(identifier: string): SecurityValidationResult {
	const now = Date.now();
	const key = identifier;
	const existing = rateLimitStore.get(key);

	if (!existing || now > existing.resetTime) {
		// Reset or initialize
		rateLimitStore.set(key, {
			count: 1,
			resetTime: now + SECURITY_CONSTANTS.RATE_LIMIT_WINDOW_MS,
		});
		return { isValid: true };
	}

	if (existing.count >= SECURITY_CONSTANTS.MAX_REQUESTS_PER_MINUTE) {
		return {
			isValid: false,
			error: "Rate limit exceeded. Please try again later.",
			statusCode: 429,
		};
	}

	// Increment count
	existing.count += 1;
	rateLimitStore.set(key, existing);

	return { isValid: true };
}

export function createSecureApiHandler(
	systemPrompt: string,
	endpointName: string,
) {
	return async function (req: Request) {
		try {
			const { messages, userId } = await req.json();

			// Rate limiting (use IP or userId as identifier)
			const clientId =
				userId || req.headers.get("x-forwarded-for") || "anonymous";
			const rateLimitResult = checkRateLimit(clientId);
			if (!rateLimitResult.isValid) {
				return new Response(rateLimitResult.error, {
					status: rateLimitResult.statusCode,
				});
			}

			// Input validation
			const validationResult = validateRequest(messages, userId);
			if (!validationResult.isValid) {
				return new Response(validationResult.error, {
					status: validationResult.statusCode,
				});
			}

			// Sanitize inputs
			const sanitizedMessages = sanitizeMessages(messages);
			if (sanitizedMessages.length === 0) {
				return new Response("No valid messages provided", { status: 400 });
			}

			// Import AI SDK dynamically to avoid issues
			const { openai } = await import("@ai-sdk/openai");
			const { streamText } = await import("ai");

			const messagesWithSystem = [
				{ role: "system", content: systemPrompt },
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
			console.error(`${endpointName} API error:`, error);
			return new Response("Internal server error", { status: 500 });
		}
	};
}

export function logSecurityEvent(
	type: "RATE_LIMIT" | "VALIDATION_ERROR" | "SUSPICIOUS_ACTIVITY",
	details: {
		endpoint?: string;
		userId?: string;
		ip?: string;
		error?: string;
		timestamp?: number;
	},
) {
	// Log security events for monitoring
	console.warn(`[SECURITY] ${type}:`, {
		...details,
		timestamp: details.timestamp || Date.now(),
	});

	// In production, you might want to:
	// - Send to logging service (e.g., Datadog, LogRocket)
	// - Store in database for analysis
	// - Trigger alerts for suspicious patterns
}

export function cleanupRateLimitStore() {
	// Clean up expired entries periodically
	const now = Date.now();
	for (const [key, value] of rateLimitStore.entries()) {
		if (now > value.resetTime) {
			rateLimitStore.delete(key);
		}
	}
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
	setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
