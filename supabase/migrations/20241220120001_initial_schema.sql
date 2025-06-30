-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums (IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('free', 'premium', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE goal_type AS ENUM ('get_clarity', 'build_confidence', 'explain_what_i_do', 'boost_career', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_stage AS ENUM ('conceptualizing', 'just_launched', 'one_to_five_years', 'industry_pro', 'local_household_name');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE section_type AS ENUM ('educational', 'guided');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'open_ended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE achievement_type AS ENUM ('card_completed', 'perfect_score', 'streak', 'fast_learner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (renamed from users in migration 20241220120004)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company_name TEXT,
    subscription_status subscription_status DEFAULT 'free' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal goal_type NOT NULL,
    goal_other_text TEXT,
    business_stage business_stage NOT NULL,
    business_stage_other_text TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Create card_sections table
CREATE TABLE IF NOT EXISTS card_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type section_type NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES card_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Create answer_choices table
CREATE TABLE IF NOT EXISTS answer_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    section_id UUID REFERENCES card_sections(id) ON DELETE SET NULL,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    status progress_status DEFAULT 'not_started' NOT NULL,
    score INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create question_attempts table
CREATE TABLE IF NOT EXISTS question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer_id UUID REFERENCES answer_choices(id) ON DELETE SET NULL,
    open_ended_answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0 NOT NULL,
    attempt_number INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    conversation_data JSONB DEFAULT '{}' NOT NULL,
    current_step TEXT DEFAULT 'start' NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create brand_purpose_statements table
CREATE TABLE IF NOT EXISTS brand_purpose_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    statement_text TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    audience_score INTEGER CHECK (audience_score >= 0 AND audience_score <= 2) NOT NULL,
    benefit_score INTEGER CHECK (benefit_score >= 0 AND benefit_score <= 2) NOT NULL,
    belief_score INTEGER CHECK (belief_score >= 0 AND belief_score <= 2) NOT NULL,
    impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 2) NOT NULL,
    total_score INTEGER GENERATED ALWAYS AS (audience_score + benefit_score + belief_score + impact_score) STORED,
    is_current BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    session_end TIMESTAMPTZ,
    total_time_seconds INTEGER,
    cards_visited TEXT[],
    actions_taken JSONB DEFAULT '[]' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type achievement_type NOT NULL,
    achievement_data JSONB DEFAULT '{}' NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
CREATE INDEX IF NOT EXISTS idx_cards_order_index ON cards(order_index);
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at ON cards(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_card_sections_card_id ON card_sections(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sections_order_index ON card_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_section_id ON questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_answer_choices_question_id ON answer_choices(question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_card_id ON user_progress(card_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_card_id ON ai_conversations(card_id);
CREATE INDEX IF NOT EXISTS idx_brand_purpose_statements_user_id ON brand_purpose_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_purpose_statements_is_current ON brand_purpose_statements(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_responses_user_id_unique ON onboarding_responses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_unique ON user_progress(user_id, card_id, section_id, question_id) WHERE section_id IS NOT NULL AND question_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_purpose_current_user ON brand_purpose_statements(user_id) WHERE is_current = true;

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_responses_updated_at ON onboarding_responses;
CREATE TRIGGER update_onboarding_responses_updated_at BEFORE UPDATE ON onboarding_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_sections_updated_at ON card_sections;
CREATE TRIGGER update_card_sections_updated_at BEFORE UPDATE ON card_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_answer_choices_updated_at ON answer_choices;
CREATE TRIGGER update_answer_choices_updated_at BEFORE UPDATE ON answer_choices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_purpose_statements_updated_at ON brand_purpose_statements;
CREATE TRIGGER update_brand_purpose_statements_updated_at BEFORE UPDATE ON brand_purpose_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one current brand purpose statement per user
CREATE OR REPLACE FUNCTION ensure_single_current_brand_purpose()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE brand_purpose_statements 
        SET is_current = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_current_brand_purpose_trigger ON brand_purpose_statements;
CREATE TRIGGER ensure_single_current_brand_purpose_trigger
    BEFORE INSERT OR UPDATE ON brand_purpose_statements
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_brand_purpose();

-- Function to auto-increment brand purpose statement version
CREATE OR REPLACE FUNCTION set_brand_purpose_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT COALESCE(MAX(version), 0) + 1 
        INTO NEW.version 
        FROM brand_purpose_statements 
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_brand_purpose_version_trigger ON brand_purpose_statements;
CREATE TRIGGER set_brand_purpose_version_trigger
    BEFORE INSERT ON brand_purpose_statements
    FOR EACH ROW
    EXECUTE FUNCTION set_brand_purpose_version(); 