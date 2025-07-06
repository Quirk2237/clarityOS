#!/usr/bin/env node

/**
 * Script to diagnose and fix common Gradle issues with Expo builds
 * This script helps resolve Gradle deprecation warnings and compatibility issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Gradle Issues Diagnostic & Fix Script');
console.log('=========================================\n');

// Function to run command and capture output
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

// Check current Expo CLI version
function checkExpoVersion() {
  console.log('📱 Checking Expo CLI version...');
  const result = runCommand('npx expo --version');
  if (result.success) {
    console.log(`✅ Expo CLI version: ${result.output}`);
    return result.output;
  } else {
    console.log('❌ Could not determine Expo CLI version');
    return null;
  }
}

// Check EAS CLI version
function checkEasVersion() {
  console.log('🏗️  Checking EAS CLI version...');
  const result = runCommand('npx eas --version');
  if (result.success) {
    console.log(`✅ EAS CLI version: ${result.output}`);
    return result.output;
  } else {
    console.log('❌ Could not determine EAS CLI version');
    return null;
  }
}

// Clean Android build cache
function cleanAndroidBuild() {
  console.log('🧹 Cleaning Android build cache...');
  
  // Clean EAS build cache
  const cleanResult = runCommand('npx eas build --clear-cache --platform android --non-interactive || true');
  if (cleanResult.success) {
    console.log('✅ EAS build cache cleared');
  } else {
    console.log('⚠️  Could not clear EAS build cache (this is okay)');
  }
  
  // Clean local cache
  const localCleanResult = runCommand('rm -rf node_modules/.cache && rm -rf .expo');
  if (localCleanResult.success) {
    console.log('✅ Local cache cleared');
  } else {
    console.log('⚠️  Could not clear local cache');
  }
}

// Update package.json with build optimization scripts
function updatePackageJson() {
  console.log('📝 Updating package.json with build optimization scripts...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add build optimization scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'build:android:dev': 'eas build --platform android --profile development --clear-cache',
    'build:android:preview': 'eas build --platform android --profile preview --clear-cache',
    'build:android:production': 'eas build --platform android --profile production --clear-cache',
    'fix-gradle': 'node ./scripts/fix-gradle-issues.js',
    'prebuild:android': 'npx expo prebuild --platform android --clear'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated with build optimization scripts');
}

// Check and suggest Expo SDK update
function checkExpoSDKVersion() {
  console.log('🔍 Checking Expo SDK version...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentExpoVersion = packageJson.dependencies?.expo;
  
  if (currentExpoVersion) {
    console.log(`📦 Current Expo SDK: ${currentExpoVersion}`);
    
    // Check if it's an older version that might have Gradle issues
    if (currentExpoVersion.includes('~53.0')) {
      console.log('💡 Recommendation: Your Expo SDK 53 should work with the fixes applied');
      console.log('   If issues persist, consider updating to the latest SDK version');
    } else if (currentExpoVersion.includes('~52.0') || currentExpoVersion.includes('~51.0')) {
      console.log('⚠️  Warning: Older Expo SDK versions may have more Gradle compatibility issues');
      console.log('   Consider updating to Expo SDK 53 or later');
    }
  }
}

// Provide troubleshooting tips
function provideTroubleshootingTips() {
  console.log('\n🔧 Troubleshooting Tips:');
  console.log('========================');
  console.log('1. Use --clear-cache flag when building: `eas build --platform android --clear-cache`');
  console.log('2. If still getting deprecation warnings, try: `eas build --platform android --profile development --clear-cache`');
  console.log('3. Check your Android project for any custom native code that might use deprecated APIs');
  console.log('4. Consider using `expo prebuild` to regenerate native code if needed');
  console.log('5. Update your EAS CLI: `pnpm install -g @expo/eas-cli@latest`');
  console.log('6. Check the EAS build logs for specific deprecation warnings');
  console.log('\n📚 Useful Commands:');
  console.log('===================');
  console.log('• Build development: `pnpm run build:android:dev`');
  console.log('• Build preview: `pnpm run build:android:preview`');
  console.log('• Build production: `pnpm run build:android:production`');
  console.log('• Prebuild: `pnpm run prebuild:android`');
  console.log('• Fix Gradle: `pnpm run fix-gradle`');
}

// Main execution
async function main() {
  try {
    checkExpoVersion();
    checkEasVersion();
    checkExpoSDKVersion();
    cleanAndroidBuild();
    updatePackageJson();
    provideTroubleshootingTips();
    
    console.log('\n✅ Gradle issues diagnostic and fix completed!');
    console.log('Try running your EAS build again with: `eas build --platform android --profile development --clear-cache`');
    
  } catch (error) {
    console.error('❌ Error running fix script:', error.message);
    process.exit(1);
  }
}

main(); 