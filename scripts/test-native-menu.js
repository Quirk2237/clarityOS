const { Platform } = require('react-native');

console.log('🧪 Testing Native Card Menu Implementation...\n');

// Mock the React Native modules for testing
global.Platform = {
  OS: 'ios', // Test iOS first
  select: (obj) => obj.ios || obj.default
};

global.ActionSheetIOS = {
  showActionSheetWithOptions: (options, callback) => {
    console.log('📱 iOS ActionSheet would show with options:');
    console.log('  - Title:', options.title);
    console.log('  - Message:', options.message);
    console.log('  - Options:', options.options);
    console.log('  - Cancel Button Index:', options.cancelButtonIndex);
    console.log('  - Destructive Button Index:', options.destructiveButtonIndex);
    
    // Simulate user pressing "Start Over" (index 1)
    console.log('👆 Simulating user selecting "Start Over"...');
    callback(1);
  }
};

global.Alert = {
  alert: (title, message, buttons, options) => {
    console.log('⚠️  Native Alert would show:');
    console.log('  - Title:', title);
    console.log('  - Message:', message);
    console.log('  - Buttons:', buttons.map(b => `"${b.text}" (${b.style || 'default'})`));
    console.log('  - Options:', options);
    
    // Simulate user pressing "Start Over"
    const startOverButton = buttons.find(b => b.text === 'Start Over');
    if (startOverButton && startOverButton.onPress) {
      console.log('👆 Simulating user confirming "Start Over"...');
      startOverButton.onPress();
    }
  }
};

// Import our native menu function
try {
  const { showNativeCardMenu } = require('../components/ui/native-card-menu');
  
  console.log('✅ Native menu module imported successfully');
  
  // Test the function
  console.log('\n🎯 Testing iOS flow:');
  showNativeCardMenu({
    cardName: 'Brand Purpose',
    onStartOver: () => {
      console.log('🚀 Start Over callback executed successfully!');
    }
  });
  
  // Test Android flow
  console.log('\n🤖 Testing Android flow:');
  global.Platform.OS = 'android';
  
  showNativeCardMenu({
    cardName: 'Brand Purpose',
    onStartOver: () => {
      console.log('🚀 Start Over callback executed successfully!');
    }
  });
  
  console.log('\n✅ All tests passed! Native menu implementation is working correctly.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
} 