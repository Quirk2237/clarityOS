-- Fix ai_conversations table to prevent duplicate conversations
-- Add unique constraint and handle existing duplicates

-- First, let's clean up any existing duplicates by keeping only the most recent conversation per user/card
WITH ranked_conversations AS (
  SELECT 
    id,
    user_id,
    card_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, card_id 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM ai_conversations
),
duplicates_to_delete AS (
  SELECT id 
  FROM ranked_conversations 
  WHERE rn > 1
)
DELETE FROM ai_conversations 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Now add the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_conversations_user_card_unique 
ON ai_conversations(user_id, card_id);

-- Add a comment for documentation
COMMENT ON INDEX idx_ai_conversations_user_card_unique IS 
'Ensures only one active conversation per user per card'; 