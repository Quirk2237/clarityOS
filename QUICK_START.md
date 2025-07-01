# 🚀 Quick Start: Fixing Network Errors

If you're seeing "Network request failed" errors, follow these steps:

## ✅ **Immediate Fix (5 minutes)**

### 1. **Setup Environment Variables**
```bash
# Run the validation script
node scripts/validate-environment.js
```

This will create a `.env.local` file if it doesn't exist. Update it with:
- Your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
- Your Supabase credentials from your project dashboard

### 2. **Clear Cache and Restart**
```bash
# Clear all caches
pnpm clean

# Restart development server
pnpm start --clear
```

### 3. **Test the Fix**
- Open the app
- Navigate to any brand card
- Start a guided discovery session
- Send a message

## 🔧 **If Issues Persist**

### Check Network Connectivity
```bash
# Test in production mode
pnpm run debug-network
```

### Verify API Configuration
```bash
# Run comprehensive checks
pnpm setup
```

### Check Console Logs
Look for these specific errors:
- `OPENAI_API_KEY not found` → Update .env.local
- `Network request failed` → Check internet connection
- `404 Invalid URL` → Clear cache and restart

## 📞 **Still Having Issues?**

1. Check the [AI SDK Setup Guide](docs/ai-sdk-setup.md)
2. Run the test suite: `pnpm test-api`
3. Create an issue with error logs

## 🎉 **Success Indicators**

You'll know it's working when you see:
- ✅ AI responds to your messages
- ✅ Conversation flows smoothly
- ✅ No network errors in console
- ✅ Progress tracking works

## 🔍 **Troubleshooting Steps**

### Step 1: Environment Setup
```bash
# Check if .env.local exists
ls -la .env.local

# If not found, create it
node scripts/validate-environment.js
```

### Step 2: Validate API Keys
Make sure your `.env.local` contains:
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Clear All Caches
```bash
# Clear Expo cache
rm -rf .expo

# Clear Node modules
rm -rf node_modules
pnpm install

# Clear Metro cache
pnpm start --clear
```

### Step 4: Test Connection
```bash
# Test basic setup
pnpm verify-ai

# Test API security
pnpm test-api
```

## 🐛 **Common Error Solutions**

### "Network request failed"
- ✅ Check internet connection
- ✅ Verify API key is correct
- ✅ Restart development server

### "API configuration error"
- ✅ Run `node scripts/validate-environment.js`
- ✅ Update `.env.local` with real API keys

### "Module AppRegistry is not a registered callable module"
- ✅ Run `expo start --no-dev --minify`
- ✅ Check for Babel configuration errors

### "Metro bundler ECONNREFUSED"
- ✅ Run `rm -rf .expo`
- ✅ Check for firewall/proxy issues

## 💡 **Pro Tips**

1. **Always restart after env changes**: Environment variables require a server restart
2. **Check API key format**: OpenAI keys start with `sk-proj-` or `sk-`
3. **Monitor console logs**: Watch for specific error messages
4. **Use production mode**: Test with `expo start --no-dev --minify`

## 📱 **Testing on Device**

1. Make sure your device and computer are on the same network
2. Check firewall settings aren't blocking the connection
3. Use device logs for more detailed error information

---

**Need help?** See [AI SDK Setup Guide](docs/ai-sdk-setup.md) for detailed instructions. 