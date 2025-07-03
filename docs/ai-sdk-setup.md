# AI SDK Integration for ClarityOS

## 🎯 Overview

ClarityOS uses the AI SDK to power intelligent brand strategy discovery across 7 core brand pillars. The AI functionality runs through a centralized **Supabase Edge Function** with the OpenAI API key securely managed as a Supabase secret.

## 📋 Setup Checklist

### ✅ **Already Configured**
- [x] AI SDK packages installed (`@ai-sdk/openai`, `@ai-sdk/react`, `ai`)
- [x] Polyfills setup for Expo compatibility
- [x] Centralized Supabase Edge Function (`ai-handler`)
- [x] Database schema for AI conversations
- [x] React hooks for chat integration
- [x] Guided discovery components

### ⚙️ **Required Setup**

#### 1. Environment Variables
Create `.env.local` file in root directory:

```bash
# ==========================================
# Supabase Configuration
# ==========================================
# Client-side variables (safe to expose - prefixed with EXPO_PUBLIC_)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# ==========================================
# Development Configuration
# ==========================================
NODE_ENV=development

# ==========================================
# NOTE: OpenAI API Key is now a Supabase Secret
# ==========================================
# DO NOT add OPENAI_API_KEY to this file
# Instead, set it as a Supabase secret using:
# pnpm supabase secrets set OPENAI_API_KEY sk-your-key-here
```

#### 2. OpenAI API Key Setup (Supabase Secret)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key with appropriate usage limits
3. Set as Supabase secret (NOT in `.env.local`):
   ```bash
   pnpm supabase secrets set OPENAI_API_KEY sk-your-openai-api-key-here
   ```
4. **Security**: The API key is now securely stored in Supabase's environment, not locally

#### 3. Deploy Edge Function

**🎯 Preferred Method (No Docker Required):**
Request AI assistant to deploy the Edge Function using MCP tools:
```
Ask AI: "Please deploy the ai-handler Edge Function using MCP"
```

**🔄 Alternative Method (Requires Docker):**
Deploy locally (requires Docker Desktop to be running):
```bash
pnpm supabase functions deploy ai-handler
```

## 🧠 AI Integration Architecture

### **Centralized Edge Function Architecture**

All AI conversations now flow through a single Supabase Edge Function:

```
React Native App → useChat Hook → Supabase Edge Function → OpenAI API
                                      ↓
                              Database (Cards & Prompts)
```

**Benefits:**
- **Security**: OpenAI API key never exposed to client
- **Scalability**: New cards added via database, no code changes
- **Reliability**: Structured JSON responses eliminate parsing errors
- **Maintainability**: Single source of truth for AI logic

### **Edge Function Endpoint**
```
POST ${EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-handler
```

**Request Body:**
```json
{
  "messages": [...],  // Conversation history
  "task": "purpose",  // Card slug (purpose, positioning, etc.)
  "userId": "user_id" // Optional for authenticated users
}
```

**Response:**
```json
{
  "scores": {
    "audience": 2,
    "benefit": 1,
    "belief": 2,
    "impact": 1
  },
  "responseText": "AI's conversational reply",
  "question": "Next question to ask",
  "isComplete": false
}
```

## 🔧 **Troubleshooting**

### Common Issues

#### "Missing authorization header" Error
This indicates the OpenAI API key is not properly set as a Supabase secret.

**Fix:**
```bash
# Set the OpenAI API key as a Supabase secret
pnpm supabase secrets set OPENAI_API_KEY sk-your-actual-key

# Redeploy the Edge Function
pnpm supabase functions deploy ai-handler
```

#### Edge Function Not Found
**Fix:**
```bash
# Deploy the Edge Function
pnpm supabase functions deploy ai-handler

# Check deployment status in Supabase dashboard
```

#### Local Environment Shows OpenAI Key
If your local environment still has `OPENAI_API_KEY`, remove it:

**Fix:**
1. Edit `.env.local` and remove the `OPENAI_API_KEY` line
2. Restart your development server
3. Verify in Settings page that it shows "✅ Supabase Secret"

## 🧪 **Testing Your Setup**

### 1. Environment Validation
```bash
# Check environment setup
node scripts/validate-environment.js

# Verify AI setup
node scripts/verify-ai-setup.js
```

### 2. Test AI Connection
```bash
# Test Supabase connection and Edge Function
node scripts/test-ai-connection.js
```

### 3. In-App Testing
1. Open the app
2. Navigate to any brand card (e.g., Purpose)
3. Start a guided discovery session
4. Send a test message
5. Verify AI responds with structured data

### 4. Debug Information
- Go to Settings tab
- Check "Environment Status" section
- Ensure "OpenAI API Key: ✅ Supabase Secret"
- Use "Test AI Connection" to verify functionality

## ⚠️ **Security Best Practices**

### ✅ **DO:**
- Keep OpenAI API key as Supabase secret
- Use `EXPO_PUBLIC_` prefix only for client-safe variables
- Monitor API usage in OpenAI dashboard
- Set appropriate rate limits

### ❌ **DON'T:**
- Put OpenAI API key in `.env.local` or any client-side file
- Commit API keys to version control
- Use production API keys in development
- Expose sensitive environment variables

## 📱 **Production Deployment**

### 1. Supabase Setup

**🎯 Preferred Method (No Docker Required):**
1. Set production OpenAI API key via Supabase Dashboard → Project Settings → Secrets
2. Request AI assistant to deploy Edge Function to production using MCP

**🔄 Alternative Method (Requires Docker):**
```bash
# Link to production project
pnpm supabase link --project-ref your-prod-project-ref

# Set production OpenAI API key
pnpm supabase secrets set OPENAI_API_KEY sk-your-production-key

# Deploy Edge Function to production (requires Docker Desktop)
pnpm supabase functions deploy ai-handler
```

### 2. Environment Variables
Update your production environment with:
- `EXPO_PUBLIC_SUPABASE_URL` (production URL)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (production anon key)

### 3. Testing
- Test all brand cards in production
- Monitor Edge Function logs in Supabase dashboard
- Check OpenAI API usage

## 🎉 **Success Indicators**

Your setup is working correctly when:
- ✅ Settings page shows "OpenAI API Key: ✅ Supabase Secret"
- ✅ AI conversations start and respond appropriately
- ✅ No "Missing authorization header" errors in console
- ✅ Edge Function logs show successful OpenAI API calls
- ✅ User progress is saved correctly

---

**Next Steps:**
1. Set OpenAI API key as Supabase secret
2. Deploy the Edge Function
3. Test AI conversations in the app
4. Monitor performance and usage
5. Deploy to production with confidence! 🎉 