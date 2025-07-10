import { create } from 'zustand';
import { supabase } from '@/config/supabase';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  brand_name?: string;
  brand_description?: string;
  business_name?: string;
  business_stage?: 'conceptualizing' | 'just_launched' | 'one_to_five_years' | 'industry_pro' | 'local_household_name';
  business_stage_other?: string;
  what_your_business_does?: string;
  is_onboarded?: boolean;
  // Add other profile fields as needed
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface ProfileActions {
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearProfile: () => void;
  setProfile: (profile: Profile) => void;
  updateBrandInfo: (brandName: string, brandDescription: string) => Promise<void>;
  updateOnboardingInfo: (onboardingData: {
    business_name: string;
    business_stage: Profile['business_stage'];
    business_stage_other?: string;
    what_your_business_does: string;
  }) => Promise<void>;
}

export type ProfileStore = ProfileState & ProfileActions;

/**
 * Global profile store using Zustand
 * Manages user profile data including brand information and onboarding status
 * Prevents redundant API calls by centralizing profile state
 */
export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Fetch user profile from Supabase
  fetchProfile: async (userId: string) => {
    if (!userId) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      set({ 
        profile: {
          id: String(data.id),
          email: typeof data.email === 'string' ? data.email : undefined,
          full_name: typeof data.full_name === 'string' ? data.full_name : undefined,
          avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : undefined,
          brand_name: typeof data.brand_name === 'string' ? data.brand_name : undefined,
          brand_description: typeof data.brand_description === 'string' ? data.brand_description : undefined,
          business_name: typeof data.business_name === 'string' ? data.business_name : undefined,
          business_stage: data.business_stage as Profile['business_stage'],
          business_stage_other: typeof data.business_stage_other === 'string' ? data.business_stage_other : undefined,
          what_your_business_does: typeof data.what_your_business_does === 'string' ? data.what_your_business_does : undefined,
          is_onboarded: typeof data.is_onboarded === 'boolean' ? data.is_onboarded : false,
        },
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ 
        profile: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        isInitialized: true
      });
    }
  },

  // Update profile in both state and database
  updateProfile: async (updates: Partial<Profile>) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      set({ 
        profile: { ...currentProfile, ...data },
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      });
    }
  },

  // Specific method for updating brand information during onboarding (legacy)
  updateBrandInfo: async (brandName: string, brandDescription: string) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          brand_name: brandName,
          brand_description: brandDescription
        })
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      set({ 
        profile: { 
          ...currentProfile, 
          brand_name: brandName,
          brand_description: brandDescription,
          ...data 
        },
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error updating brand info:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update brand information'
      });
      throw error; // Re-throw to handle in onboarding form
    }
  },

  // New method for updating complete onboarding information
  updateOnboardingInfo: async (onboardingData: {
    business_name: string;
    business_stage: Profile['business_stage'];
    business_stage_other?: string;
    what_your_business_does: string;
  }) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          business_name: onboardingData.business_name,
          business_stage: onboardingData.business_stage,
          business_stage_other: onboardingData.business_stage_other,
          what_your_business_does: onboardingData.what_your_business_does,
          is_onboarded: true
        })
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      set({ 
        profile: { 
          ...currentProfile,
          business_name: onboardingData.business_name,
          business_stage: onboardingData.business_stage,
          business_stage_other: onboardingData.business_stage_other,
          what_your_business_does: onboardingData.what_your_business_does,
          is_onboarded: true,
          ...data 
        },
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error updating onboarding info:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update onboarding information'
      });
      throw error; // Re-throw to handle in onboarding form
    }
  },

  // Set profile directly (useful for optimistic updates)
  setProfile: (profile: Profile) => {
    set({ profile, isInitialized: true });
  },

  // Clear profile state (on logout)
  clearProfile: () => {
    set({ 
      profile: null, 
      isLoading: false, 
      error: null,
      isInitialized: false
    });
  },
})); 