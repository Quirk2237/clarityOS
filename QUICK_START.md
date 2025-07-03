# 🚀 Quick Start: Fixing AI Connection Issues

If you're seeing "Network request failed" or "Missing authorization header" errors, follow these steps:

## ✅ **Immediate Fix (5 minutes)**

### 1. **Setup Environment Variables**
```bash
# Run the validation script
node scripts/validate-environment.js
```

This will create a `.env.local` file if it doesn't exist. Update it with your Supabase credentials from your project dashboard.

### 2. **Set OpenAI API Key as Supabase Secret**
The OpenAI API key is now securely managed as a Supabase secret:

#### 🎯 Preferred Method (No Docker Required)
1. **Set API Key**: Use Supabase Dashboard → Project Settings → Secrets & Environment Variables
   - Add `OPENAI_API_KEY` with your OpenAI API key value
2. **Deploy Edge Function**: AI assistant can deploy via MCP tools (no local setup required)

#### 🔄 Alternative Method (Requires Docker)
```bash
# Set your OpenAI API key as a Supabase secret
pnpm supabase secrets set OPENAI_API_KEY sk-your-openai-api-key

# Deploy the Edge Function (requires Docker Desktop)
pnpm supabase functions deploy ai-handler
```

Get your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 3. **Clear Cache and Restart**
```bash
# Clear all caches
pnpm clean

# Restart development server
pnpm start --clear
```

### 4. **Test the Fix**
- Open the app
- Navigate to any brand card
- Start a guided discovery session
- Send a message

## 🔧 **If Issues Persist**

### Check Supabase Configuration
```bash
# Test Supabase connection and Edge Function
node scripts/test-ai-connection.js
```

### Verify Environment Setup
```bash
# Run comprehensive environment checks
node scripts/verify-ai-setup.js
```

### Check Console Logs
Look for these specific errors:
- `Missing authorization header` → OpenAI key not set as Supabase secret
- `Network request failed` → Check internet connection or Supabase URL
- `Edge Function not found` → Deploy the ai-handler function

## 📞 **Still Having Issues?**

1. Check the [AI SDK Setup Guide](docs/ai-sdk-setup.md)
2. Verify your `.env.local` file has correct Supabase credentials
3. Ensure OpenAI API key is set as Supabase secret (not in `.env.local`)
4. Create an issue with error logs

## 🎉 **Success Indicators**

You'll know it's working when you see:
- ✅ Settings page shows "OpenAI API Key: ✅ Supabase Secret"
- ✅ AI responds to your messages
- ✅ Conversation flows smoothly
- ✅ No authorization errors in console
- ✅ Progress tracking works

## 🔍 **Troubleshooting Steps**

### Step 1: Environment Setup
```bash
# Check if .env.local exists
ls -la .env.local

# If not found, create it
node scripts/validate-environment.js
```

### Step 2: Validate Supabase Configuration
Make sure your `.env.local` contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

**Important:** Do NOT add `OPENAI_API_KEY` to this file anymore.

### Step 3: Set OpenAI Key as Supabase Secret
#### 🎯 Preferred Method (No Docker Required)
- **Set API Key**: Via Supabase Dashboard → Project Settings → Secrets
- **Deploy Function**: Request AI assistant to deploy via MCP tools

#### 🔄 Alternative Method (Requires Docker)
```bash
# Set the API key securely
pnpm supabase secrets set OPENAI_API_KEY sk-your-openai-api-key

# Deploy the Edge Function (requires Docker Desktop)
pnpm supabase functions deploy ai-handler
```

### Step 4: Clear All Caches
```bash
# Clear Expo cache
pnpm start --clear

# If that doesn't work, try
rm -rf node_modules/.cache
pnpm clean
```

## 🔒 **Security Note**

**New Architecture:** AI now runs through a Supabase Edge Function with the OpenAI API key stored as a secure Supabase secret. This means:

- ✅ **More Secure**: API key never exposed to client
- ✅ **Easier Deployment**: No environment variables to manage in production
- ✅ **Better Performance**: Centralized AI logic
- ✅ **Scalable**: Add new cards without code changes

## 🆘 **Common Error Solutions**

### "Missing authorization header"
**🎯 Preferred Solution (No Docker Required):**
1. Set OpenAI API key via Supabase Dashboard → Project Settings → Secrets
2. Request AI assistant to redeploy the Edge Function using MCP tools

**🔄 Alternative Solution (Requires Docker):**
```bash
# The OpenAI API key is not set as a Supabase secret
pnpm supabase secrets set OPENAI_API_KEY sk-your-key
pnpm supabase functions deploy ai-handler
```

### "Edge Function not found"
**🎯 Preferred Solution (No Docker Required):**
Request AI assistant to deploy the ai-handler function using MCP tools

**🔄 Alternative Solution (Requires Docker):**
```bash
# Deploy the AI handler function (requires Docker Desktop)
pnpm supabase functions deploy ai-handler
```

### "Invalid Supabase URL/Key"
```bash
# Check your Supabase project dashboard for correct values
# Update .env.local with the correct URLs and keys
```

### Local OpenAI Key Warning
If you see "⚠️ Local Env" in Settings:
1. Remove `OPENAI_API_KEY` from `.env.local`
2. Restart the development server
3. Should now show "✅ Supabase Secret"

---

**Next Steps:**
1. ✅ Set OpenAI key as Supabase secret
2. ✅ Deploy Edge Function  
3. ✅ Test AI conversations
4. 🚀 Build amazing brand experiences! 