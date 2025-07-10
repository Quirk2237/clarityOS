# CanopyOS (formerly ClarityOS) - Product Requirements Document

## Vision Statement
CanopyOS is an AI-powered brand strategy app that helps everyday business owners gain brand clarity through a simple, accessible, and scalable tool — because we believe branding should be ASS: accessible, scalable, and simple.

## Technology Stack
- **AI Logic:** OpenAI GPT-4o via AI SDK
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Frontend:** React Native with Expo Router
- **Payment Processing:** RevenueCat (planned)
- **Deployment:** Expo
- **Email:** Resend (planned)

## Core Features Implemented

### 1. Authentication & Onboarding
**Status: ✅ IMPLEMENTED**

#### Welcome Screen
- Beautiful landing page with "mouse" branding
- "Get Started" CTA button
- Animated SVG illustration

#### Authentication Flow
- Sign up / Sign in modals
- Email/password authentication
- Session management with Supabase Auth
- Automatic profile creation on signup

#### Onboarding Flow
- **Question 1:** What's your goal?
  - Get clarity
  - Build confidence in what I'm selling
  - Be able to explain what I do
  - Boost my career
  - Other (with text input)
- **Question 2:** What stage is your business in?
  - Still conceptualizing
  - Just launched
  - 1-5 years in
  - Industry pro
  - Local household name
- Progress indicator
- Back/Continue navigation
- Data saved to `onboarding_responses` table

### 2. Home Screen & Navigation
**Status: ✅ IMPLEMENTED**

#### Main Interface
- Tab-based navigation (Cards, Dashboard, Settings)
- "mouse" header with tap-to-return functionality
- Card-based layout with Apple Wallet-style design
- Dark theme with vibrant green (`#ACFF64`) accent color

#### Card System
- 7 brand strategy cards in defined order:
  1. **Purpose** (Status: Open)
  2. **Positioning** (Status: Coming Soon)
  3. **Personality** (Status: Coming Soon)
  4. **Product-Market Fit** (Status: Coming Soon)
  5. **Perception** (Status: Coming Soon)
  6. **Presentation** (Status: Coming Soon)
  7. **Proof** (Status: Coming Soon)

#### Card Features
- Dynamic status management (open/coming_soon/completed)
- Progress tracking with visual indicators
- Card colors and cover images
- Three-dot menu with "Start Over" functionality
- Auto-prioritization of next available card

### 3. Educational Quiz System
**Status: ✅ FULLY IMPLEMENTED**

#### Purpose Card Educational Content
- 5 multiple-choice questions with scoring
- Gamified experience similar to Duolingo
- Progress bar and navigation
- Immediate feedback on answers
- "Try Again" functionality for incorrect answers
- Score calculation and storage

#### Quiz Questions (Purpose Card)
1. "What is a brand's purpose?"
2. "Which of the following is a strong example of brand purpose?"
3. "Which factor matters most when uncovering your brand's purpose?"
4. "A clear brand purpose statement is MOST likely to include:"
5. "Why is brand purpose important?"

#### Features
- Shuffled answer choices
- Unlimited retries
- Progress auto-save to database
- Completion modal with score display
- Smooth transitions between questions

### 4. AI-Powered Guided Discovery
**Status: ✅ FULLY IMPLEMENTED**

#### Conversation Engine
- Structured AI conversations using OpenAI GPT-4o
- Custom prompts for each brand category
- Real-time scoring across 4 dimensions:
  - **Audience** (who it serves): 0-2 points
  - **Benefit** (how it helps): 0-2 points
  - **Belief** (what it stands for): 0-2 points
  - **Impact** (why it matters): 0-2 points

#### Interactive Features
- Apple Wallet-style card stack interface
- Gesture-based navigation (pan to reveal previous questions)
- Real-time score widgets with explanations
- Conversation state persistence
- Anonymous user support

#### AI Logic Flow
**STEP 1: Opening Question**
"Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?"

**STEP 2: Follow-up Logic**
Dynamic follow-up questions based on missing elements:
- Audience gaps: "Who exactly would feel that loss most?"
- Benefit gaps: "What does your brand help them do, feel, or become?"
- Belief gaps: "What does that say about what your brand stands for?"
- Impact gaps: "How are their lives different because your brand exists?"

**STEP 3: Synthesis**
AI generates draft brand purpose statement:
"We exist to [transform/help/support] [audience] by [what you do/offer], because we believe [value/belief]."

**STEP 4: Validation & Refinement**
User validates statement with refinement options for specific areas

#### Brand-Specific AI Prompts
Each card has customized AI prompts:
- **Purpose:** Focus on why the brand exists and its impact
- **Positioning:** Market position and competitive advantage
- **Personality:** Brand character and communication style
- **Product-Market Fit:** Market need validation and solution fit
- **Perception:** Current vs. desired brand perception
- **Presentation:** Visual identity and consistency
- **Proof:** Credibility and trust signals

### 5. Progress Management System
**Status: ✅ IMPLEMENTED**

#### User Progress Tracking
- Individual card progress (not_started/in_progress/completed)
- Section-level progress (educational vs. guided)
- Score tracking for educational sections
- Conversation state persistence
- Achievement system framework

#### Data Storage
- **Local Storage:** Anonymous users via AsyncStorage
- **Database Storage:** Authenticated users via Supabase
- **Brand Purpose Statements:** Scored and versioned storage
- **AI Conversations:** Full conversation history with state management

### 6. Database Architecture
**Status: ✅ IMPLEMENTED**

#### Core Tables
- `profiles` - User account information
- `onboarding_responses` - Onboarding survey data
- `cards` - Brand strategy card definitions
- `card_sections` - Educational and guided sections
- `questions` & `answer_choices` - Quiz content
- `user_progress` - Progress tracking
- `question_attempts` - Quiz attempt history
- `ai_conversations` - AI conversation state
- `brand_purpose_statements` - Generated brand statements
- `user_sessions` - Usage analytics
- `achievements` - Gamification system

#### Advanced Features
- Row Level Security (RLS) policies
- Automatic timestamp management
- Soft deletes with `deleted_at` fields
- Comprehensive indexing for performance

## New Features Discovered in Implementation

### 1. Anonymous User Support
- Guest users can use the app without authentication
- Progress saved locally with automatic sync on signup
- Anonymous session IDs for AI conversations

### 2. Apple Wallet-Style Interface
- Sophisticated card stack with gesture controls
- Real-time score visualization
- Animated transitions and feedback

### 3. Comprehensive AI System
- Multiple specialized AI endpoints for each brand card
- Structured response parsing with Zod schemas
- Error handling and retry logic
- Context-aware conversation management

### 4. Advanced Progress System
- Intelligent next-card prioritization
- Fresh data loading for accurate progress
- Reset functionality with confirmation
- Visual progress indicators

## Planned Features (Not Yet Implemented)

### 1. Dashboard Screen
**Status: 🚧 PLACEHOLDER**
- User progress statistics
- Achievement badges
- Brand statement gallery
- Usage analytics

### 2. Settings Screen
**Status: 🚧 PLACEHOLDER**
- Profile management
- Account settings
- Password changes
- Email updates
- Logout functionality
- Feedback system

### 3. Premium Features
**Status: 📋 PLANNED**
- RevenueCat integration
- Subscription management
- Premium card unlocking
- Advanced AI features

### 4. Social Features
**Status: 📋 PLANNED**
- Brand statement sharing
- Progress sharing
- Community features

### 5. Content Expansion
**Status: 📋 PLANNED**
- Complete educational content for all 7 cards
- Additional brand categories
- Personalized recommendations

## Technical Implementation Notes

### UI/UX Design System
- Dark theme with `#1A1A1A` background
- Vibrant green (`#ACFF64`) primary color
- FunnelSans typography
- Consistent spacing and animations
- Platform-specific optimizations

### Performance Optimizations
- Intelligent caching for card data
- Lazy loading for large datasets
- Optimized database queries
- Efficient state management

### Error Handling
- Graceful fallbacks for AI failures
- Offline capability for core features
- User-friendly error messages
- Automatic retry mechanisms

## Success Metrics

### User Engagement
- Card completion rates
- Time spent in guided discovery
- Return user percentage
- Educational quiz scores

### Product Quality
- AI conversation satisfaction
- Brand statement quality ratings
- User feedback scores
- Support ticket volume

### Business Metrics
- User acquisition cost
- Retention rates
- Conversion to premium
- Viral coefficient

## Next Development Priorities

1. **Complete All 7 Cards** - Implement full educational and guided content
2. **Dashboard Implementation** - Build comprehensive progress dashboard
3. **Settings Screen** - Complete user account management
4. **Premium Integration** - Implement RevenueCat subscription system
5. **Content Quality** - Refine AI prompts and educational materials
6. **Performance Optimization** - Improve loading times and responsiveness
7. **Social Features** - Add sharing and community capabilities

---

*Last Updated: January 2025*
*Status: Version 2.0 - Comprehensive Implementation Review*
