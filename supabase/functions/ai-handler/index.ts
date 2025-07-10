import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { generateObject } from "npm:ai@4.3.16";
import { z } from "npm:zod";
import { getSystemPrompt } from "./prompts.ts";

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

serve(async (req: Request) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		console.log('🚀 AI Handler - Request received');
		
		// ✅ Parse and validate request body
		let requestBody;
		try {
			requestBody = await req.json();
			console.log('📋 Request body parsed:', {
				hasMessages: !!requestBody.messages,
				messagesLength: requestBody.messages?.length || 0,
				task: requestBody.task,
				userId: requestBody.userId,
			});
		} catch (parseError) {
			console.error('❌ Failed to parse request JSON:', parseError);
			return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const { messages, task, userId, businessContext } = requestBody;

		// ✅ Validate required fields
		if (!messages || !Array.isArray(messages)) {
			console.error('❌ Missing or invalid messages array');
			return new Response(JSON.stringify({ error: 'messages array is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		if (!task) {
			console.error('❌ Missing task field');
			return new Response(JSON.stringify({ error: 'task field is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		if (!userId) {
			console.error('❌ Missing userId field');
			return new Response(JSON.stringify({ error: 'userId field is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// ✅ Log business context information
		console.log('🏢 Business context received:', {
			hasData: businessContext?.hasData || false,
			businessName: businessContext?.businessName || 'Not provided',
			businessStage: businessContext?.businessStage || 'Not provided',
			source: businessContext?.source || 'unknown'
		});

		// ✅ Check OpenAI API key
		const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
		if (!openaiApiKey) {
			console.error('❌ Missing OPENAI_API_KEY environment variable');
			return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		console.log('🔑 OpenAI API key found, length:', openaiApiKey.length);

		const openai = createOpenAI({
			apiKey: openaiApiKey,
		});

		// Get the appropriate system prompt based on the card/task and business context
		let systemPrompt;
		try {
			systemPrompt = getSystemPrompt(task, businessContext);
			console.log('📝 System prompt loaded for task:', task, 'with business context');
		} catch (promptError) {
			console.error('❌ Failed to get system prompt:', promptError);
			return new Response(JSON.stringify({ error: 'Invalid task or prompt error' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// ✅ Ensure messages are in correct format for AI SDK
		const formattedMessages = messages.map((msg: any, index: number) => {
			if (!msg.role || !msg.content) {
				console.error(`❌ Invalid message at index ${index}:`, msg);
				throw new Error(`Message at index ${index} missing role or content`);
			}
			return {
				role: msg.role,
				content: msg.content,
			};
		});

		console.log('💬 Calling OpenAI with messages:', formattedMessages.length);

		// ✅ Use generateObject with proper error handling
		const result = await generateObject({
			model: openai('gpt-4o'),
			schema: ClaritySchema,
			system: systemPrompt,
			messages: formattedMessages,
			temperature: 0.4,
			maxTokens: 2000,
		});

		console.log('✅ OpenAI response received successfully');

		// ✅ Return simple JSON response
		return new Response(JSON.stringify(result.object), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
		
	} catch (err) {
		const error = err as Error;
		console.error('❌ Error in AI handler:', {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});
		
		return new Response(JSON.stringify({ 
			error: error.message,
			details: 'Check edge function logs for more information'
		}), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
}); 