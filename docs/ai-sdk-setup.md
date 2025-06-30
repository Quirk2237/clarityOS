# AI SDK Integration for ClarityOS

## 🎯 Overview

ClarityOS uses the AI SDK to power intelligent brand strategy discovery across 7 core brand pillars. Each card has its own specialized ChatGPT-powered conversation flow that guides users to clarity.

## 📋 Setup Checklist

### ✅ **Already Configured**
- [x] AI SDK packages installed (`@ai-sdk/openai`, `@ai-sdk/react`, `ai`)
- [x] Polyfills setup for Expo compatibility
- [x] 7 specialized API routes created
- [x] Database schema for AI conversations
- [x] React hooks for chat integration
- [x] Guided discovery components

### ⚙️ **Required Setup**

#### 1. Environment Variables
Create `.env.local` file in root directory:

```bash
# ==========================================
# OpenAI Configuration (Server-side only)
# ==========================================
OPENAI_API_KEY=sk-your-openai-api-key-here

# ==========================================
# Supabase Configuration
# ==========================================
# Client-side variables (safe to expose - prefixed with EXPO_PUBLIC_)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Server-side only (for admin operations if needed)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### 2. OpenAI API Key Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key with appropriate usage limits
3. Add to `.env.local` file
4. **Security**: Never commit `.env.local` to version control

## 🧠 AI Integration Architecture

### **7 Brand Discovery Cards**

| Card | API Route | Purpose | AI Prompt Focus |
|------|-----------|---------|-----------------|
| **Purpose** | `/api/brand-purpose` | Why the brand exists | Values, impact, meaning |
| **Positioning** | `/api/brand-positioning` | Market differentiation | Competition, unique value |
| **Personality** | `/api/brand-personality` | Brand character & voice | Traits, communication style |
| **Product-Market Fit** | `/api/product-market-fit` | Solution-market alignment | Demand validation, effectiveness |
| **Perception** | `/api/brand-perception` | How customers see you | Current vs. desired image |
| **Presentation** | `/api/brand-presentation` | Visual & message consistency | Touchpoints, guidelines |
| **Proof** | `/api/brand-proof` | Credibility & trust signals | Social proof, authority |

### **Conversation Flow Pattern**

Each AI conversation follows a 4-step discovery process:

1. **Opening Question** - Strategic, thought-provoking start
2. **Multi-dimensional Scoring** - AI evaluates response across 4 key areas (0-2 points each)
3. **Follow-up Questions** - Dynamic questions based on gaps identified
4. **Synthesis & Validation** - AI generates framework, user refines

## 💻 Code Architecture

### **API Routes Structure**
```typescript
// Example: app/api/brand-purpose+api.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM_PROMPT = `
ROLE: [Specialized brand strategist role]
GOAL: [Clear outcome definition]
STEP 1: [Opening question strategy]
STEP 2: [Follow-up logic]
STEP 3: [Synthesis format]  
STEP 4: [Validation process]
`;

export async function POST(req: Request) {
  const { messages, userId } = await req.json();
  
  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ],
    maxTokens: 800,
    temperature: 0.7,
  });

  return result.toDataStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
```

### **React Integration**
```typescript
// Using the chat hook
import { useChat } from "@ai-sdk/react";

const { messages, input, handleInputChange, handleSubmit, isLoading } = 
  useChat({
    api: "/api/brand-purpose", // Dynamic based on card
    onFinish: (message) => {
      // Extract and save generated frameworks
    },
  });
```

### **Database Storage**
```sql
-- AI conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  card_id UUID REFERENCES cards(id),
  conversation_data JSONB, -- Stores full conversation state
  current_step TEXT,
  is_completed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Generated brand statements
CREATE TABLE brand_purpose_statements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  statement_text TEXT,
  audience_score INTEGER,
  benefit_score INTEGER,
  belief_score INTEGER,
  impact_score INTEGER,
  total_score INTEGER GENERATED ALWAYS AS (
    audience_score + benefit_score + belief_score + impact_score
  ) STORED
);
```

## 🚀 Usage Examples

### **Starting a Brand Discovery Session**
```typescript
// In your card component
const { startSession, messages, handleSubmit } = useBrandPurposeChat();

// Initialize conversation
useEffect(() => {
  if (user) {
    startSession(user.id);
  }
}, [user]);
```

### **Handling AI Responses**
```typescript
// The AI will guide users through questions like:
// 1. "Imagine your brand disappeared tomorrow..."
// 2. "Who exactly would feel that loss most?"
// 3. "What does your brand help them do, feel, or become?"
// 4. Final synthesis into structured framework
```

## 🎨 UI Integration

### **Conversation Interface**
- Real-time streaming responses
- Progress tracking (4 dimensions × 2 points = 8 total)
- Auto-save conversation state
- Beautiful message bubbles with thinking indicators
- Generated frameworks displayed in formatted cards

### **Gamification Elements**
- Progress bars showing dimension completion
- Achievement badges for completed discoveries
- Streak tracking for daily engagement
- XP points for thoughtful responses

## 🔒 Security & Best Practices

### **✅ Implemented Security Features**

#### **Rate Limiting**
- 10 requests per minute per user/IP
- Automatic cleanup of expired rate limit entries
- Graceful rate limit exceeded responses

#### **Input Validation & Sanitization**
- Maximum 50 messages per conversation
- 2000 character limit per message
- Content sanitization and trimming
- Role validation (user/assistant only)
- Array and type validation

#### **Authentication & Authorization**
- User ID validation for brand discovery routes
- Session verification through Supabase
- Row Level Security (RLS) on database tables

#### **Error Handling**
- Comprehensive try-catch blocks
- Secure error messages (no internal details exposed)
- Structured logging for debugging
- Different error codes for different failure types

#### **Content Security**
```typescript
// Security constants applied to all routes
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_COUNT = 50;

// Input sanitization
const sanitizedMessages = messages.map(msg => ({
  ...msg,
  content: msg.content.slice(0, MAX_MESSAGE_LENGTH).trim(),
  role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user'
})).filter(msg => msg.content.length > 0);
```

### **Production Security Enhancements**

#### **Recommended for Production**
- **Redis Rate Limiting**: Replace in-memory store with Redis
- **API Key Rotation**: Implement OpenAI key rotation
- **Request Logging**: Log all API requests for audit
- **IP Whitelisting**: Restrict API access to known IPs
- **Content Filtering**: Add profanity/inappropriate content detection
- **Usage Monitoring**: Track API usage and costs
- **DDoS Protection**: Implement CloudFlare or similar

#### **Monitoring & Alerts**
```typescript
// Security event logging
logSecurityEvent('RATE_LIMIT', {
  endpoint: 'brand-purpose',
  userId: user.id,
  ip: clientIP,
  error: 'Rate limit exceeded'
});
```

### **Conversation Privacy**
- All conversations tied to authenticated users
- Option to delete conversation history
- No sensitive data in console logs
- GDPR-compliant data handling

## 📊 Analytics & Insights

### **Track Conversation Quality**
- Average conversation length
- Completion rates by card type
- Most common follow-up patterns
- User satisfaction scores

### **Business Intelligence**
- Popular business types and goals
- Common brand challenges
- Success pattern identification
- Content improvement opportunities

## 🛠️ Development Workflow

### **Testing AI Conversations**
1. Test each card's opening question
2. Verify scoring logic works correctly
3. Check follow-up question selection
4. Validate final framework generation
5. Test edge cases and error handling

### **Prompt Engineering**
- A/B test different opening questions
- Optimize follow-up question triggers
- Refine synthesis templates
- Monitor conversation quality metrics

## 🚨 Troubleshooting

### **Common Issues**
- **"No OpenAI API key"**: Check `.env.local` file exists and is valid
- **"Streaming failed"**: Verify polyfills are imported in `_layout.tsx`
- **"Database error"**: Ensure user is authenticated and RLS policies allow access
- **"Chat not responding"**: Check network connection and API rate limits

### **Debug Tools**
- Console logs in development
- Supabase dashboard for database queries
- OpenAI usage dashboard for API monitoring
- Expo debugger for mobile-specific issues

## 📈 Future Enhancements

### **Planned Features**
- Multi-language support
- Voice input capabilities
- AI-generated visual frameworks
- Integration with design tools
- Collaborative brand sessions
- Advanced analytics dashboard

### **Scalability Considerations**
- Conversation caching strategies
- API rate limit management
- Database indexing optimization
- CDN for static assets

---

## 🎉 Your AI Integration is Ready!

Your ClarityOS app now has a complete AI-powered brand strategy system that rivals professional consulting services. Users can discover their brand purpose, positioning, personality, and more through intelligent conversations that feel personal and insightful.

**Next Steps:**
1. Add your OpenAI API key to `.env.local`
2. Test each card's conversation flow
3. Customize prompts based on user feedback
4. Launch and gather user insights! 