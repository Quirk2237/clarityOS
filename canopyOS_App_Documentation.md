# canopyOS App Documentation

## Overview

**canopyOS** is a React Native mobile application built with Expo that helps everyday business owners develop their brand strategy through interactive learning experiences. The app uses a card-based system where each card focuses on different aspects of brand development, combining educational content with AI-powered guided discovery.

### Technology Stack
- **Frontend**: Expo React Native with TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **AI Integration**: OpenAI API via Supabase Edge Functions
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + Supabase Provider

---

## App Architecture & Navigation

### Root Structure
```
app/
├── _layout.tsx              # Root layout with AuthProvider
├── welcome.tsx              # Onboarding screen
├── sign-in.tsx             # Authentication
├── sign-up.tsx             # User registration
└── (protected)/            # Authenticated routes
    ├── _layout.tsx         # Protected layout
    ├── modal.tsx           # Modal overlay
    ├── (tabs)/             # Main tab navigation
    │   ├── _layout.tsx     # Tab layout
    │   ├── index.tsx       # Cards screen (main)
    │   ├── dashboard.tsx   # Analytics (coming soon)
    │   └── settings.tsx    # User settings & diagnostics
    └── cards/
        └── [slug]/
            └── index.tsx   # Individual card details
```

### Navigation Flow
1. **App Start** → Welcome Screen
2. **Welcome Screen** → Sign In/Sign Up (or go directly to app if authenticated)
3. **Main App** → Tab Navigation (Settings | Cards | Dashboard)
4. **Cards** → Individual Card → Quiz Flow

---

## Screen-by-Screen Breakdown

### 1. Welcome Screen (`app/welcome.tsx`)
**Purpose**: App introduction and onboarding entry point

**Features**:
- App branding with ClarityOS logo
- Welcome illustration (SVG)
- "Get Started" button that navigates to main app
- Clean, branded interface with primary color background

**User Journey**: 
- New users see this screen first
- Existing authenticated users bypass this screen
- Single CTA leads to the main application

---

### 2. Authentication Screens

#### Sign Up (`app/sign-up.tsx`)
**Purpose**: User registration with email/password

**Features**:
- Email and password input fields
- Form validation using React Hook Form
- Creates user profile in database on successful registration
- Modal presentation style
- Error handling and loading states

**Workflow**:
1. User enters email/password
2. Supabase creates auth user
3. App creates profile record in `profiles` table
4. Triggers data migration from local storage (if any)
5. Redirects to main app

#### Sign In (`app/sign-in.tsx`)
**Purpose**: User authentication for returning users

**Features**:
- Email/password login
- Form validation
- Error handling
- Data migration trigger on successful login
- Modal presentation

---

### 3. Main App - Tab Navigation

#### Settings Tab (`app/(protected)/(tabs)/settings.tsx`)
**Purpose**: User account management and app diagnostics

**Features**:
- **Environment Status**: Shows configuration status
  - OpenAI API key location (Supabase secrets vs local)
  - Supabase configuration status
  - Current environment info
- **AI Connection Test**: Debug tool to test OpenAI integration
  - Custom message input
  - Real-time AI response streaming
  - Connection status feedback
- **Account Management**: Sign out functionality

**Use Cases**:
- Developers: Debug AI/API connectivity issues
- Users: Manage account settings
- Support: Diagnose environment problems

#### Dashboard Tab (`app/(protected)/(tabs)/dashboard.tsx`)
**Purpose**: Analytics and progress tracking (placeholder)

**Current State**: "Coming Soon" placeholder
**Planned Features**: User progress analytics, completion rates, brand strategy insights

#### Cards Tab (`app/(protected)/(tabs)/index.tsx`) - **PRIMARY SCREEN**
**Purpose**: Main interface for brand strategy learning

**Key Features**:

1. **Card Display System**:
   - Shows brand strategy cards in priority order
   - Featured/active card prominently displayed
   - Progress indicators for each card
   - Card-specific imagery and branding
   - Status indicators (Open, Coming Soon, Completed)

2. **Card Types** (Based on API endpoints):
   - **Brand Purpose**: Core "why" and mission
   - **Brand Positioning**: Market positioning strategy  
   - **Brand Personality**: Voice, tone, and character
   - **Product-Market Fit**: Solution-market alignment
   - **Brand Perception**: How customers see the brand
   - **Brand Presentation**: Visual identity and messaging
   - **Brand Proof**: Evidence and credibility

3. **Progress Management**:
   - Visual progress bars showing completion percentage
   - Status tracking (Not Started, In Progress, Completed)
   - Works for both authenticated and anonymous users
   - Data migration between local and cloud storage

4. **Card Actions**:
   - **Start/Continue**: Begin or resume card workflow
   - **Menu Options**: Reset progress, start over
   - **Completion States**: Visual feedback for finished cards

**User Journey**:
1. User sees prioritized list of brand strategy cards
2. Active/next card is highlighted prominently
3. User taps to start educational quiz
4. Progresses through guided discovery
5. Returns to see updated progress
6. Continues with next card

---

## Core Workflows

### 1. Quiz System Architecture

#### Educational Quiz (`components/quiz/educational-quiz.tsx`)
**Purpose**: Multiple-choice learning phase to teach brand strategy concepts

**Features**:
- **Question Flow**: Structured progression through educational content
- **Answer Selection**: Multiple choice with icons/images
- **Immediate Feedback**: Right/wrong indicators with explanations
- **Scoring System**: Tracks accuracy and completion
- **Progress Tracking**: Visual progress bar
- **Results Screen**: Performance summary before moving to guided discovery

**Question Structure**:
- Question text with contextual examples
- 2-4 answer choices with icons
- Correct answer indication
- Explanatory feedback
- Sequential progression

**Workflow**:
1. Load questions for card section
2. Present question with answer choices
3. User selects answer
4. Show immediate feedback (correct/incorrect)
5. Record progress in database/local storage
6. Continue to next question or complete quiz
7. Calculate score and show completion modal
8. Proceed to Guided Discovery

#### Guided Discovery (`components/quiz/guided-discovery.tsx`)
**Purpose**: AI-powered conversational brand strategy development

**Features**:
- **AI Integration**: Uses OpenAI via Supabase Edge Functions
- **Conversational Flow**: Dynamic questioning based on user responses
- **Scoring System**: Tracks 4 key dimensions:
  - **Audience**: Target market clarity
  - **Benefit**: Value proposition strength  
  - **Belief**: Brand values and mission
  - **Impact**: Customer outcomes
- **Real-time Progress**: Visual score widgets showing development
- **Context-Aware**: Questions adapt to card type (Purpose vs Positioning, etc.)
- **Draft Generation**: AI creates brand statement when complete
- **Validation Loop**: User can refine and iterate

**Conversation States**:
1. **Opening**: Initial brand discussion
2. **Follow-up**: Deeper exploration questions
3. **Synthesis**: AI generates draft brand statement
4. **Validation**: User reviews and approves/refines
5. **Refinement**: Targeted improvements
6. **Complete**: Final brand statement ready

**AI Integration**:
- Structured prompts based on card type
- Streaming responses for better UX
- Contextual examples and suggestions
- Score calculation in real-time
- Handles both authenticated and anonymous users

**User Journey**:
1. Start with opening question about brand
2. AI asks follow-up questions based on responses
3. Visual score widgets show progress in 4 dimensions
4. AI generates draft brand statement when ready
5. User validates and refines until satisfied
6. Complete with final brand strategy output

### 2. Data Management System

#### Progress Tracking (`lib/progress-manager.ts`)
**Purpose**: Unified progress management for authenticated and anonymous users

**Features**:
- **Dual Storage**: Local storage for anonymous, Supabase for authenticated
- **Migration System**: Seamlessly transfers local data when user signs up
- **Card Progress**: Tracks completion status, scores, and section progress
- **Question Attempts**: Records individual question responses
- **Conversation State**: Saves AI chat progress and context

**Storage Strategy**:
- **Anonymous Users**: React Native AsyncStorage
- **Authenticated Users**: Supabase database
- **Migration**: Automatic transfer on sign-up/sign-in

#### Data Migration (`lib/data-migration.ts`)
**Purpose**: Transfer user progress from local to cloud storage

**Triggers**:
- User signs up for first time
- User signs in on new device
- Manual migration on authentication state change

**Process**:
1. Check for local data
2. Validate and transform data structure
3. Upload to Supabase user tables
4. Verify successful migration
5. Clean up local storage (optional)

---

## User Journeys

### New User (Anonymous)
1. **App Launch** → Welcome Screen
2. **Get Started** → Cards Screen
3. **Select Card** → Educational Quiz
4. **Complete Quiz** → Guided Discovery
5. **AI Conversation** → Brand Strategy Development
6. **Progress Saved Locally**
7. **Optional**: Sign Up → Data Migration to Cloud

### Returning User (Authenticated)
1. **App Launch** → Auto-navigate to Cards (skip welcome)
2. **Cards Screen** → Shows progress from previous sessions
3. **Continue Card** → Resume where left off
4. **Complete Cards** → Build comprehensive brand strategy
5. **Progress Synced** → Available across devices

### Developer/Debug Flow
1. **Settings Tab** → Environment diagnostics
2. **Test AI Connection** → Verify OpenAI integration
3. **Review Status** → Check configuration
4. **Debug Issues** → Troubleshoot connectivity

---

## Key Features & Capabilities

### 1. Offline/Online Hybrid
- Works without authentication
- Local progress storage
- Seamless cloud sync when authenticated
- No data loss during transitions

### 2. AI-Powered Personalization
- Dynamic questioning based on responses
- Context-aware examples and suggestions
- Structured brand strategy output
- Multi-dimensional scoring system

### 3. Progressive Learning
- Educational foundation before strategy work
- Scaffolded learning approach
- Visual progress feedback
- Completion rewards and advancement

### 4. Cross-Platform Compatibility
- Expo React Native for iOS/Android
- Web support through React Native Web
- Consistent experience across platforms

### 5. Developer-Friendly
- Comprehensive debugging tools
- Environment status monitoring
- AI connection testing
- Error boundary protection

---

## Technical Implementation Details

### Authentication Flow
```typescript
// Supabase Auth Provider wraps entire app
<AuthProvider>
  // Routes automatically protected/unprotected
  // Data migration triggered on auth state change  
  // Progress synced between local and cloud
</AuthProvider>
```

### AI Integration
```typescript
// Edge Function calls to OpenAI
POST /functions/v1/ai-handler
{
  task: "brand-purpose", // Card type
  userId: "user-id",
  messages: [...] // Conversation history
}
```

### Data Structure
- **Cards**: Brand strategy topics with sections
- **Sections**: Educational + Guided discovery phases  
- **Questions**: Multiple choice educational content
- **Progress**: User completion tracking
- **Conversations**: AI chat history and state

### Error Handling
- AI Error Boundary for graceful AI failures
- Network error recovery
- Offline data persistence
- Fallback UI states

---

## Current Limitations & Future Enhancements

### Current Limitations
1. **Dashboard**: Placeholder screen (not implemented)
2. **Card Management**: Limited to pre-defined cards
3. **Social Features**: No sharing or collaboration
4. **Export Options**: No brand strategy export functionality

### Planned Enhancements
1. **Analytics Dashboard**: Progress visualization and insights
2. **Brand Strategy Export**: PDF/document generation
3. **Team Collaboration**: Multi-user brand development
4. **Advanced AI**: More sophisticated brand strategy generation
5. **Integration**: Connect with marketing tools and platforms

---

## Getting Started (Developer)

### Key Files to Understand
1. `app/(protected)/(tabs)/index.tsx` - Main cards interface
2. `components/quiz/educational-quiz.tsx` - Learning component
3. `components/quiz/guided-discovery.tsx` - AI strategy building
4. `context/supabase-provider.tsx` - Authentication and data management
5. `lib/progress-manager.ts` - Progress tracking system

### Development Workflow
1. **Local Development**: `pnpm start` - Runs with local progress
2. **Authentication Testing**: Create test accounts to verify data migration
3. **AI Testing**: Use Settings tab to test OpenAI connectivity
4. **Database Management**: Supabase dashboard for data inspection

This documentation reflects the current state of canopyOS as a sophisticated brand strategy development tool that combines educational content with AI-powered personalized guidance, supporting both anonymous and authenticated users with seamless data management.