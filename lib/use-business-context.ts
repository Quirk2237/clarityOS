import { useEffect, useState } from 'react';
import { useAuth } from '@/context/supabase-provider';
import { useProfileStore } from '@/stores/profile-store';
import { getAnonymousOnboardingData, type AnonymousOnboardingData } from './anonymous-storage';

// Unified business context interface
export interface BusinessContext {
  business_name: string | null;
  business_stage: 'conceptualizing' | 'just_launched' | 'one_to_five_years' | 'industry_pro' | 'local_household_name' | null;
  business_stage_other: string | null;
  what_your_business_does: string | null;
  isLoading: boolean;
  hasData: boolean;
  source: 'authenticated' | 'anonymous' | 'none';
}

/**
 * Unified hook to get business context data from either:
 * - Profile store (for authenticated users)
 * - Anonymous storage (for anonymous users)
 * 
 * This provides a consistent interface regardless of user authentication state
 */
export function useBusinessContext(): BusinessContext {
  const { session } = useAuth();
  const { profile, isLoading: profileLoading } = useProfileStore();
  const [anonymousData, setAnonymousData] = useState<AnonymousOnboardingData | null>(null);
  const [isLoadingAnonymous, setIsLoadingAnonymous] = useState(false);

  // Load anonymous data when user is not authenticated
  useEffect(() => {
    if (!session) {
      setIsLoadingAnonymous(true);
      getAnonymousOnboardingData()
        .then(setAnonymousData)
        .catch((error) => {
          console.error('Error loading anonymous business context:', error);
          setAnonymousData(null);
        })
        .finally(() => setIsLoadingAnonymous(false));
    } else {
      // Clear anonymous data when user is authenticated
      setAnonymousData(null);
      setIsLoadingAnonymous(false);
    }
  }, [session]);

  // Determine data source and return unified interface
  if (session && profile) {
    // Authenticated user with profile data
    return {
      business_name: profile.business_name || null,
      business_stage: profile.business_stage || null,
      business_stage_other: profile.business_stage_other || null,
      what_your_business_does: profile.what_your_business_does || null,
      isLoading: profileLoading,
      hasData: !!(profile.business_name && profile.business_stage && profile.what_your_business_does),
      source: 'authenticated'
    };
  } else if (!session && anonymousData) {
    // Anonymous user with stored onboarding data
    return {
      business_name: anonymousData.business_name,
      business_stage: anonymousData.business_stage,
      business_stage_other: anonymousData.business_stage_other || null,
      what_your_business_does: anonymousData.what_your_business_does,
      isLoading: isLoadingAnonymous,
      hasData: true,
      source: 'anonymous'
    };
  } else {
    // No data available (user not authenticated or anonymous user without onboarding)
    return {
      business_name: null,
      business_stage: null,
      business_stage_other: null,
      what_your_business_does: null,
      isLoading: session ? profileLoading : isLoadingAnonymous,
      hasData: false,
      source: 'none'
    };
  }
}

/**
 * Utility function to get a formatted business description for AI prompts
 */
export function getBusinessDescription(context: BusinessContext): string {
  if (!context.hasData) {
    return "A business (details not yet provided)";
  }

  const stageDescription = context.business_stage === 'conceptualizing' ? 'conceptualizing their business idea' :
                          context.business_stage === 'just_launched' ? 'a newly launched business' :
                          context.business_stage === 'one_to_five_years' ? 'an established business (1-5 years old)' :
                          context.business_stage === 'industry_pro' ? 'an industry professional/expert' :
                          context.business_stage === 'local_household_name' ? 'a well-known local business' :
                          'a business';

  const businessType = context.what_your_business_does || 'business activities not specified';
  const businessName = context.business_name || 'business name not specified';

  return `${businessName}, ${stageDescription}. They focus on: ${businessType}`;
}

/**
 * Utility function to check if user has sufficient business context for guided discovery
 */
export function hasMinimalBusinessContext(context: BusinessContext): boolean {
  return !!(context.business_name && context.business_stage && context.what_your_business_does);
} 