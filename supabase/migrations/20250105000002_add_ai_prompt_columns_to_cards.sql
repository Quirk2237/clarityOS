-- Add a column to store the initial question for each card's AI session
ALTER TABLE public.cards
ADD COLUMN initial_question TEXT;

COMMENT ON COLUMN public.cards.initial_question IS 'The first question the AI asks to kick off a guided discovery session.';

-- Add a column to store the detailed, multi-step system prompt for the AI model
ALTER TABLE public.cards
ADD COLUMN system_prompt TEXT;

COMMENT ON COLUMN public.cards.system_prompt IS 'The detailed, multi-step system prompt for the AI model to follow. This controls the entire conversation flow, scoring, and synthesis logic.';

-- Example data will be populated in subsequent migrations or through the application
-- The prompts for each card will be added directly into this table.
-- Example for 'purpose' card:
/*
UPDATE public.cards
SET
  initial_question = 'Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?',
  system_prompt = 'ROLE: You are a strategic brand guide... (full detailed prompt)'
WHERE slug = 'purpose';
*/ 