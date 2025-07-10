import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for anonymous onboarding data
const ANONYMOUS_ONBOARDING_KEY = 'canopy_anonymous_onboarding';

export interface AnonymousOnboardingData {
  business_name: string;
  business_stage: 'conceptualizing' | 'just_launched' | 'one_to_five_years' | 'industry_pro' | 'local_household_name';
  business_stage_other?: string;
  what_your_business_does: string;
  timestamp: string; // When the data was saved
}

/**
 * Save anonymous onboarding data to AsyncStorage
 */
export async function saveAnonymousOnboardingData(data: Omit<AnonymousOnboardingData, 'timestamp'>): Promise<void> {
  try {
    const onboardingData: AnonymousOnboardingData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(ANONYMOUS_ONBOARDING_KEY, JSON.stringify(onboardingData));
    console.log('💾 Anonymous onboarding data saved to storage');
  } catch (error) {
    console.error('❌ Error saving anonymous onboarding data:', error);
    throw error;
  }
}

/**
 * Retrieve anonymous onboarding data from AsyncStorage
 */
export async function getAnonymousOnboardingData(): Promise<AnonymousOnboardingData | null> {
  try {
    const data = await AsyncStorage.getItem(ANONYMOUS_ONBOARDING_KEY);
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data) as AnonymousOnboardingData;
    console.log('📖 Anonymous onboarding data retrieved from storage');
    return parsed;
  } catch (error) {
    console.error('❌ Error retrieving anonymous onboarding data:', error);
    return null;
  }
}

/**
 * Clear anonymous onboarding data from AsyncStorage
 */
export async function clearAnonymousOnboardingData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_ONBOARDING_KEY);
    console.log('🗑️ Anonymous onboarding data cleared from storage');
  } catch (error) {
    console.error('❌ Error clearing anonymous onboarding data:', error);
    throw error;
  }
}

/**
 * Check if anonymous onboarding data exists
 */
export async function hasAnonymousOnboardingData(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(ANONYMOUS_ONBOARDING_KEY);
    return data !== null;
  } catch (error) {
    console.error('❌ Error checking for anonymous onboarding data:', error);
    return false;
  }
} 