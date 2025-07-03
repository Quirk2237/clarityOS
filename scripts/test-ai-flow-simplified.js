#!/usr/bin/env node

/**
 * Test script for the simplified AI flow (without AI SDK)
 * Tests the new fetch-based approach to ensure it works correctly
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testSimplifiedAIFlow() {
  console.log('🧪 Testing Simplified AI Flow (No AI SDK)');
  console.log('=====================================');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  try {
    // Test the Edge Function directly
    const testMessage = {
      messages: [
        { role: 'user', content: 'I run a sustainable packaging company that helps small businesses reduce their environmental impact.' }
      ],
      task: 'purpose',
      userId: 'test-user-123'
    };

    console.log('📤 Sending test request to Edge Function...');
    console.log('Request payload:', JSON.stringify(testMessage, null, 2));

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify(testMessage),
    });

    console.log('📥 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Edge Function Error:', errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Edge Function Response:');
    console.log(JSON.stringify(result, null, 2));

    // Validate response structure
    if (result.question && typeof result.isComplete === 'boolean' && result.scores) {
      console.log('✅ Response structure is valid');
      
      // Check scores
      const { audience, benefit, belief, impact } = result.scores;
      if (typeof audience === 'number' && typeof benefit === 'number' && 
          typeof belief === 'number' && typeof impact === 'number') {
        console.log('✅ Scores are valid numbers');
        console.log(`📊 Scores: Audience=${audience}, Benefit=${benefit}, Belief=${belief}, Impact=${impact}`);
      } else {
        console.warn('⚠️ Scores are not all numbers');
      }

      if (result.isComplete && result.draftStatement) {
        console.log('✅ Draft statement provided:', result.draftStatement);
      }

    } else {
      console.error('❌ Response structure is invalid');
      process.exit(1);
    }

    console.log('\n🎉 Simplified AI Flow Test Complete!');
    console.log('✅ Edge Function is working correctly');
    console.log('✅ No AI SDK dependencies needed');
    console.log('✅ Simple fetch-based approach successful');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSimplifiedAIFlow().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
}); 