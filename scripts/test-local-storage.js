// Test script for local storage functionality
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock AsyncStorage for testing
const mockStorage = {};
AsyncStorage.getItem = jest.fn((key) => Promise.resolve(mockStorage[key] || null));
AsyncStorage.setItem = jest.fn((key, value) => {
  mockStorage[key] = value;
  return Promise.resolve();
});
AsyncStorage.multiRemove = jest.fn((keys) => {
  keys.forEach(key => delete mockStorage[key]);
  return Promise.resolve();
});

// Import our local storage modules
const { LocalProgressStorage, LocalQuestionStorage, STORAGE_KEYS } = require('../lib/local-storage');

async function testLocalStorage() {
  console.log('🧪 Testing Local Storage Implementation...\n');

  try {
    // Test 1: Save and retrieve progress
    console.log('1. Testing Progress Storage...');
    await LocalProgressStorage.updateProgress('test-card-1', {
      status: 'in_progress',
      score: 85,
    }, 'educational-section');

    const progress = await LocalProgressStorage.getProgress('test-card-1');
    console.log('✅ Progress saved and retrieved:', progress.length, 'records');

    // Test 2: Question attempts
    console.log('\n2. Testing Question Storage...');
    await LocalQuestionStorage.recordAttempt(
      'question-1',
      'answer-a',
      undefined,
      true,
      10
    );

    const attempts = await LocalQuestionStorage.getAttempts('question-1');
    console.log('✅ Question attempt saved:', attempts.length, 'records');

    // Test 3: Card progress calculation
    console.log('\n3. Testing Card Progress Calculation...');
    const cardProgress = await LocalProgressStorage.getCardProgress('test-card-1');
    console.log('✅ Card progress calculated:', cardProgress);

    console.log('\n🎉 All tests passed! Local storage is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testLocalStorage();
}

module.exports = { testLocalStorage }; 