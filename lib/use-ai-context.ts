import { useMemo } from 'react';
import { useProfileStore } from '../stores/profile-store';

interface BrandContext {
  brand_name?: string;
  brand_description?: string;
}

interface AIContextResult {
  brandContext: string;
  isLoading: boolean;
  error: string | null;
  refreshBrandContext: () => Promise<void>;
}

/**
 * Hook that provides brand context for AI prompts
 * Fetches the user's brand_name and brand_description from their profile
 * and formats it for inclusion in AI system prompts
 */
export function useAIContext(): AIContextResult {
  const { profile, isLoading, error } = useProfileStore();

  // Format brand context for AI prompts using memoization for performance
  const brandContext = useMemo(() => {
    if (!profile?.brand_name && !profile?.brand_description) {
      return '';
    }

    let context = '\n\n--- USER BRAND CONTEXT ---\n';
    
    if (profile.brand_name) {
      context += `Brand Name: "${profile.brand_name}"\n`;
    }
    
    if (profile.brand_description) {
      context += `Brand Description: "${profile.brand_description}"\n`;
    }
    
    context += 'Please personalize your responses and examples based on this brand information when relevant.\n';
    context += '--- END BRAND CONTEXT ---\n';
    
    return context;
  }, [profile?.brand_name, profile?.brand_description]);

  return {
    brandContext,
    isLoading,
    error,
    refreshBrandContext: async () => {
      // The profile store handles its own refresh logic
      // This is a no-op since we rely on the store's data
    },
  };
} 