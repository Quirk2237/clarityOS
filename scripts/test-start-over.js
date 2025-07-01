const { ProgressManager } = require('../lib/progress-manager');
const { LocalProgressStorage, LocalQuestionStorage, LocalAIStorage } = require('../lib/local-storage');

async function testStartOverFunctionality() {
  console.log('🧪 Testing Start Over functionality...\n');

  try {
    // Test with unauthenticated user (local storage)
    console.log('📱 Testing local storage reset...');
    const progressManager = new ProgressManager(null);

    // Create some mock progress data
    const testCardId = 'test-card-123';
    
    // Add some test progress
    await LocalProgressStorage.updateProgress(testCardId, {
      status: 'in_progress',
      score: 85,
      totalQuestions: 10,
      correctAnswers: 8
    }, 'educational');

    await LocalProgressStorage.updateProgress(testCardId, {
      status: 'completed',
      score: 92,
      totalQuestions: 8,
      correctAnswers: 7
    }, 'guided');

    // Check progress before reset
    const progressBefore = await LocalProgressStorage.getCardProgress(testCardId);
    console.log('Progress before reset:', progressBefore);

    // Reset the card progress
    await progressManager.resetCardProgress(testCardId);

    // Check progress after reset
    const progressAfter = await LocalProgressStorage.getCardProgress(testCardId);
    console.log('Progress after reset:', progressAfter);

    // Verify reset was successful
    if (progressAfter.progress === 0 && progressAfter.status === 'not_started') {
      console.log('✅ Local storage reset successful!');
    } else {
      console.log('❌ Local storage reset failed!');
    }

    console.log('\n🎉 Start Over functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStartOverFunctionality(); 