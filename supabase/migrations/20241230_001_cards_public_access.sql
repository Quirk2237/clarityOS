-- Update cards table RLS policy to allow public access (no auth required)

-- Drop the existing authentication-required policy
DROP POLICY IF EXISTS "Authenticated users can view active cards" ON cards;

-- Create new public access policy (no authentication required)
CREATE POLICY "Public can view active cards" ON cards
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Also update card_sections policy to match (no auth required)
DROP POLICY IF EXISTS "Authenticated users can view active card sections" ON card_sections;

CREATE POLICY "Public can view active card sections" ON card_sections
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Update questions policy to match (no auth required)
DROP POLICY IF EXISTS "Authenticated users can view active questions" ON questions;

CREATE POLICY "Public can view active questions" ON questions
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

-- Update answer choices policy to match (no auth required)
DROP POLICY IF EXISTS "Authenticated users can view answer choices" ON answer_choices;

CREATE POLICY "Public can view answer choices" ON answer_choices
    FOR SELECT USING (deleted_at IS NULL); 