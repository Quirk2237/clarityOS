# AI Migration: Step-by-Step Task List

This document provides a detailed, actionable checklist for executing the migration from local `app/api` routes to the centralized, database-driven Supabase Edge Function, as outlined in `ai-migration-plan.md`.

---

### ✅ **Phase 1: Database and Environment Setup**

**Goal**: Prepare the database schema and environment for the new architecture.

-   [ ] **1. Create SQL Migration File**
    -   Create a new file: `supabase/migrations/<timestamp>_add_ai_prompt_columns_to_cards.sql`.
    -   Add the following SQL to the file:
        ```sql
        ALTER TABLE public.cards ADD COLUMN initial_question TEXT;
        ALTER TABLE public.cards ADD COLUMN system_prompt TEXT;
        ```

-   [ ] **2. Apply Database Migration**
    -   Open your terminal and run `pnpm supabase db push` to apply the changes to your local and linked remote database.

-   [ ] **3. Populate Card Prompts**
    -   Go to the Supabase Dashboard and navigate to the `cards` table.
    -   For each card (e.g., 'purpose', 'perception'), copy the `BRAND_..._SYSTEM_PROMPT` content from its corresponding `app/api/*.ts` file into the new `system_prompt` column.
    -   For each card, define a compelling `initial_question` and add it to the `initial_question` column.

-   [ ] **4. Set Supabase Secrets**
    -   Run the following command in your terminal, replacing `sk-your-key-here` with your actual OpenAI API key:
        ```bash
        pnpm supabase secrets set OPENAI_API_KEY sk-your-key-here
        ```

---

### ✅ **Phase 2: Edge Function Implementation**

**Goal**: Create the centralized `ai-handler` Edge Function.

-   [ ] **1. Create Shared CORS File**
    -   Create a new file: `supabase/functions/_shared/cors.ts`.
    -   Add the following code:
        ```typescript
        export const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        };
        ```

-   [ ] **2. Create Main Edge Function**
    -   Create the directory: `supabase/functions/ai-handler`.
    -   Create a new file within that directory: `index.ts`.
    -   Paste the full Edge Function code from `docs/ai-migration-plan.md` into this file. This includes the `aiResponseSchema` and the main `serve` function.

-   [ ] **3. Deploy the Edge Function**
    -   Run the following command from your terminal:
        ```bash
        pnpm supabase functions deploy ai-handler --no-verify-jwt
        ```
    -   Check the Supabase dashboard under "Edge Functions" to confirm the deployment was successful.

---

### ✅ **Phase 3: Client-Side Refactoring**

**Goal**: Update the `guided-discovery.tsx` component to communicate with the new Edge Function.

-   [ ] **1. Locate the `useChat` Hook**
    -   Open the file: `components/quiz/guided-discovery.tsx`.

-   [ ] **2. Update `api` and `body` Parameters**
    -   Modify the `useChat` configuration to point to the new function and include the `task`:
        ```typescript
        const { messages, input, ... } = useChat({
          api: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler`,
          body: {
            task: card.slug,
            userId: effectiveUserId,
          },
          // ... rest of the config
        });
        ```

-   [ ] **3. Update `headers` Parameter**
    -   Ensure the user's auth token is being passed in the headers:
        ```typescript
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        ```

-   [ ] **4. Refactor `onFinish` Callback**
    -   Replace the existing `onFinish` logic with the new JSON parsing logic:
        ```typescript
        onFinish: async (message) => {
          try {
            const aiData = JSON.parse(message.content);
            const { scores, question, isComplete } = aiData;
            // ... update state using this structured data
            setCurrentQuestion(question);
            setConversationState(prev => ({ ...prev, scores, step: isComplete ? 'complete' : 'follow_up' }));
            if (isComplete) {
              await handleCompletion();
            }
          } catch (e) {
            console.error("Failed to parse AI JSON response", e);
          }
        },
        ```

-   [ ] **5. Update Initial Message**
    -   Modify the `initialMessages` property of `useChat` to use the `initial_question` from the `card` prop, ensuring it's sourced from the database.
        ```typescript
        initialMessages: [
          {
            id: "initial",
            role: "assistant",
            content: card.initial_question || "Let's begin.", // Fallback text
          },
        ],
        ```

-   [ ] **6. Remove Obsolete Code**
    -   Delete the helper functions `extractScoresFromResponse` and `extractQuestionFromContent` from the component file.
    -   Delete the `getApiEndpoint` function.

---

### ✅ **Phase 4: Testing and Cleanup**

**Goal**: Verify the new system works and remove the old code.

-   [ ] **1. Thoroughly Test Each Card**
    -   Launch the application.
    -   Navigate to each brand discovery card.
    -   Verify that the initial question is correct.
    -   Engage in a conversation, ensuring the follow-up questions are logical and the scores update correctly in the UI.
    -   Complete a session to ensure the final synthesis and completion logic works.
    -   Check the Supabase function logs for any errors during testing.

-   [ ] **2. Delete Old API Routes**
    -   Once all tests pass and you are confident in the new system, delete the entire `app/api` directory.

-   [ ] **3. Final Confirmation**
    -   Run one final test to ensure the application works correctly after deleting the old API routes.

---

**Migration Complete!**
Your AI system is now fully migrated to the new, scalable architecture. 