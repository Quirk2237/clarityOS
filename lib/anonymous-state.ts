import { getAnonymousOnboardingData, type AnonymousOnboardingData } from './anonymous-storage';

/**
 * Check if the current user is anonymous (no session) but has completed onboarding
 */
export async function isAnonymousWithOnboarding(): Promise<boolean> {
  try {
    const data = await getAnonymousOnboardingData();
    return data !== null;
  } catch (error) {
    console.error('Error checking anonymous onboarding status:', error);
    return false;
  }
}

/**
 * Get the anonymous user's onboarding data if it exists
 */
export async function getAnonymousUserData(): Promise<AnonymousOnboardingData | null> {
  try {
    return await getAnonymousOnboardingData();
  } catch (error) {
    console.error('Error retrieving anonymous user data:', error);
    return null;
  }
}

/**
 * Check if the user should be shown the welcome screen or can proceed to main app
 * This is for anonymous users - authenticated users are handled separately
 */
export async function shouldShowWelcome(): Promise<boolean> {
  try {
    const hasOnboardingData = await isAnonymousWithOnboarding();
    // If anonymous user has completed onboarding, they don't need to see welcome again
    return !hasOnboardingData;
  } catch (error) {
    console.error('Error determining welcome screen state:', error);
    // Default to showing welcome on error
    return true;
  }
}

/**
 * Get the appropriate navigation destination for anonymous users
 */
export async function getAnonymousNavigationTarget(): Promise<'/welcome' | '/'> {
  try {
    const hasOnboardingData = await isAnonymousWithOnboarding();
    if (hasOnboardingData) {
      // Anonymous user with onboarding data can access main app
      return '/';
    } else {
      // Anonymous user without onboarding should see welcome
      return '/welcome';
    }
  } catch (error) {
    console.error('Error determining navigation target:', error);
    // Default to welcome screen on error
    return '/welcome';
  }
}

export interface AnonymousUserState {
  isAnonymous: boolean;
  hasOnboardingData: boolean;
  onboardingData: AnonymousOnboardingData | null;
  shouldAllowMainApp: boolean;
}

/**
 * Get comprehensive anonymous user state information
 */
export async function getAnonymousUserState(): Promise<AnonymousUserState> {
  try {
    const onboardingData = await getAnonymousOnboardingData();
    const hasOnboardingData = onboardingData !== null;
    
    return {
      isAnonymous: true,
      hasOnboardingData,
      onboardingData,
      shouldAllowMainApp: hasOnboardingData,
    };
  } catch (error) {
    console.error('Error getting anonymous user state:', error);
    return {
      isAnonymous: true,
      hasOnboardingData: false,
      onboardingData: null,
      shouldAllowMainApp: false,
    };
  }
} 