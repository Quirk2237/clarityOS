# AI Logic Migration to Supabase Edge Functions

This document outlines the architectural plan to migrate all AI-powered chat and discovery logic from the local `app/api` routes to a single, scalable, database-driven Supabase Edge Function.

**Author**: ClarityOS AI Assistant
**Date**: 2024-01-11
**Status**: Proposed

---

## 1. Objective

The primary goal is to centralize our AI logic into a more robust, scalable, and secure architecture. Moving from individual Expo API routes to a centralized Supabase Edge Function provides several key advantages:
- **Scalability**: New AI-powered "cards" or features can be added by inserting a row in the database, with no code changes required.
- **Maintainability**: AI prompts and logic are managed as data in the `cards` table, not as hardcoded strings in multiple files.
- **Reliability**: We will switch from text-based AI responses to structured JSON streams (`streamObject`), which eliminates brittle client-side parsing and guarantees data integrity.
- **Security**: All core logic and the `OPENAI_API_KEY` are moved from the Expo backend to a secure Supabase environment.

---

## 2. Architectural Plan

The migration will be executed in four phases:

### Phase 1: Enhance the Database Schema

We will add two new columns to the `cards` table to store the entire logic for any given AI conversation. This is the cornerstone of making the system data-driven.

**Action**: Create a new SQL migration file.

**File**: `supabase/migrations/<timestamp>_add_ai_prompt_columns_to_cards.sql`

**Content**:
```sql
-- Add a column to store the initial question for each card's AI session
ALTER TABLE public.cards
ADD COLUMN initial_question TEXT;

COMMENT ON COLUMN public.cards.initial_question IS 'The first question the AI asks to kick off a guided discovery session.';

-- Add a column to store the detailed, multi-step system prompt for the AI model
ALTER TABLE public.cards
ADD COLUMN system_prompt TEXT;

COMMENT ON COLUMN public.cards.system_prompt IS 'The detailed, multi-step system prompt for the AI model to follow. This controls the entire conversation flow, scoring, and synthesis logic.';

-- The prompts for each card will be added directly into this table.
-- Example for 'purpose' card:
/*
UPDATE public.cards
SET
  initial_question = 'Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?',
  system_prompt = 'ROLE: You are a strategic brand guide... (full detailed prompt)'
WHERE slug = 'purpose';
*/
```
This change makes our AI's "brain" a part of our database.

---

### Phase 2: Create the Centralized Edge Function

We will create a single Supabase Edge Function named `ai-handler` that will replace all existing files in `app/api`.

**Action**: Create the Edge Function file.

**File**: `supabase/functions/ai-handler/index.ts`

**Key Logic**:
1.  **Receive Request**: Accepts a `POST` request with a `task` (the card's slug) and the conversation `messages`.
2.  **Authenticate**: Verifies the user's session token.
3.  **Fetch Prompt**: Queries the `cards` table to fetch the `system_prompt` based on the `task` slug.
4.  **Call AI with Structured Streaming**: Uses the `streamObject` function from the AI SDK, providing it with the fetched prompt and a Zod schema that forces the AI to return a specific JSON structure.
5.  **Stream Response**: Streams the structured JSON object back to the client.

**Code**:
```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { openai } from "npm:@ai-sdk/openai";
import { streamObject, type CoreMessage } from "npm:ai";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";

// Define the precise JSON structure we expect from the AI
const aiResponseSchema = z.object({
	scores: z.object({
		audience: z.number().min(0).max(2),
		benefit: z.number().min(0).max(2),
		belief: z.number().min(0).max(2),
		impact: z.number().min(0).max(2),
	}),
	responseText: z.string().describe("The conversational reply to display."),
	question: z.string().describe("The specific follow-up question to ask."),
	isComplete: z.boolean().describe("True only when the process is complete."),
});

serve(async (req) => {
	// ... OPTIONS request and error handling ...

	try {
		const { messages, task } = await req.json();

		const supabaseClient = createClient(/* ... */);
		// ... User authentication logic ...

		// --- DYNAMIC PROMPT FETCHING ---
		const { data: card } = await supabaseClient
			.from("cards")
			.select("system_prompt")
			.eq("slug", task)
			.single();

		if (!card || !card.system_prompt) {
			throw new Error("Could not load AI prompt for this task.");
		}
		const systemPrompt = card.system_prompt;

		// --- AI Call with Structured Output ---
		const result = await streamObject({
			model: openai("gpt-4o"),
			schema: aiResponseSchema,
			system: systemPrompt,
			messages: messages as CoreMessage[],
		});

		return new Response(result.toDataStream(), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (error) {
		// ... Error handling ...
	}
});
```

---

### Phase 3: Refactor the Client-Side Component

We will update the `guided-discovery.tsx` component to work with this new architecture.

**Action**: Modify the `useChat` hook configuration.

**File**: `components/quiz/guided-discovery.tsx`

**Key Changes**:
1.  **`api` parameter**: Point `useChat` to the new Supabase function URL: `/functions/v1/ai-handler`.
2.  **`body` parameter**: Pass the `card.slug` as the `task`.
3.  **`onFinish` callback**: This is the most important change. Instead of trying to parse text, it will now use `JSON.parse(message.content)` to get the structured data (`scores`, `question`, `isComplete`). It will then update the UI state directly from this clean data.
4.  **Initial Question**: The component will now use `card.initial_question` from its props to display the very first message, ensuring it's also sourced from the database.
5.  **Cleanup**: The old helper functions for parsing scores and questions (`extractScoresFromResponse`, etc.) will be deleted as they are now obsolete.

---

### Phase 4: Deployment and Cleanup

The final step is to deploy the new architecture and remove the old one.

1.  **Set Secrets**: Securely store the `OPENAI_API_KEY` in Supabase:
    ```bash
    pnpm supabase secrets set OPENAI_API_KEY sk-your-key-here
    ```
2.  **Deploy Function**: Push the Edge Function to Supabase:
    ```bash
    pnpm supabase functions deploy ai-handler --no-verify-jwt
    ```
3.  **Test**: Thoroughly test each card's discovery flow to ensure the new system is working as expected.
4.  **Delete Old Code**: Once confirmed, the entire `app/api` directory can be safely deleted.

This plan results in a highly flexible and professional-grade AI system that is controlled entirely through your Supabase database. 