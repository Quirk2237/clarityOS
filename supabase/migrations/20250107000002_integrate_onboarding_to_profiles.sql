-- Migration: Integrate onboarding data into profiles table
-- Remove onboarding_responses table and add onboarding columns to profiles

-- First, let's preserve any existing onboarding data by creating a temporary backup
CREATE TEMP TABLE onboarding_backup AS 
SELECT 
    user_id,
    goal,
    goal_other_text,
    business_stage,
    business_stage_other_text,
    completed_at
FROM onboarding_responses;

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_stage business_stage;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_stage_other TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS what_your_business_does TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- Create index on is_onboarded for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_onboarded ON profiles(is_onboarded);

-- Migrate existing onboarding data to profiles table
UPDATE profiles 
SET 
    business_stage = ob.business_stage,
    business_stage_other = ob.business_stage_other_text,
    is_onboarded = true
FROM onboarding_backup ob
WHERE profiles.id = ob.user_id;

-- Drop the onboarding_responses table and related objects
DROP TRIGGER IF EXISTS update_onboarding_responses_updated_at ON onboarding_responses;
DROP INDEX IF EXISTS idx_onboarding_responses_user_id;
DROP INDEX IF EXISTS idx_onboarding_responses_user_id_unique;
DROP TABLE IF EXISTS onboarding_responses;

-- Update RLS policies to remove onboarding_responses references
-- (No RLS policies to update since we're removing the table)

-- Add comments for documentation
COMMENT ON COLUMN profiles.business_name IS 'The name of the user''s business or brand';
COMMENT ON COLUMN profiles.business_stage IS 'Current stage of the business development';
COMMENT ON COLUMN profiles.business_stage_other IS 'Custom business stage description if "other" is selected';
COMMENT ON COLUMN profiles.what_your_business_does IS 'Description of what the business does';
COMMENT ON COLUMN profiles.is_onboarded IS 'Whether the user has completed the onboarding process';

-- Update the trigger function to handle profiles table updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 