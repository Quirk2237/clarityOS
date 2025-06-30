-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_purpose_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Onboarding responses policies
CREATE POLICY "Users can view own onboarding responses" ON onboarding_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding responses" ON onboarding_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding responses" ON onboarding_responses
    FOR UPDATE USING (auth.uid() = user_id);

-- Cards policies (public read access for all authenticated users)
CREATE POLICY "Authenticated users can view active cards" ON cards
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true AND deleted_at IS NULL);

-- Card sections policies (public read access for all authenticated users)
CREATE POLICY "Authenticated users can view active card sections" ON card_sections
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true AND deleted_at IS NULL);

-- Questions policies (public read access for all authenticated users)
CREATE POLICY "Authenticated users can view active questions" ON questions
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true AND deleted_at IS NULL);

-- Answer choices policies (public read access for all authenticated users)
CREATE POLICY "Authenticated users can view answer choices" ON answer_choices
    FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Question attempts policies
CREATE POLICY "Users can view own question attempts" ON question_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question attempts" ON question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can view own AI conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Brand purpose statements policies
CREATE POLICY "Users can view own brand purpose statements" ON brand_purpose_statements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand purpose statements" ON brand_purpose_statements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand purpose statements" ON brand_purpose_statements
    FOR UPDATE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id); 