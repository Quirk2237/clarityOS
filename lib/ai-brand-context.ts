import { supabase } from '@/config/supabase';

interface BrandContextData {
  brand_name?: string;
  brand_description?: string;
}

/**
 * Server-side utility to fetch and format brand context for AI prompts
 * @param userId - The authenticated user's ID
 * @returns Formatted brand context string for AI system prompts
 */
export async function getBrandContextForAI(userId: string): Promise<string> {
  if (!userId) {
    return '';
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('brand_name, brand_description')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return '';
    }

    const brandData: BrandContextData = {
      brand_name: (profile as any).brand_name || undefined,
      brand_description: (profile as any).brand_description || undefined,
    };

    return formatBrandContext(brandData);
  } catch (error) {
    console.error('Error fetching brand context for AI:', error);
    return '';
  }
}

/**
 * Formats brand context data into a string suitable for AI system prompts
 * @param brandData - The brand data object
 * @returns Formatted brand context string
 */
function formatBrandContext(brandData: BrandContextData): string {
  const { brand_name, brand_description } = brandData;
  
  if (!brand_name && !brand_description) {
    return '';
  }

  let context = '\n\n--- USER BRAND CONTEXT ---\n';
  
  if (brand_name) {
    context += `Brand Name: "${brand_name}"\n`;
  }
  
  if (brand_description) {
    context += `Brand Description: "${brand_description}"\n`;
  }
  
  context += 'Please personalize your responses and examples based on this brand information when relevant.\n';
  context += '--- END BRAND CONTEXT ---\n';
  
  return context;
}

/**
 * Adds brand context to an existing system prompt
 * @param systemPrompt - The original system prompt
 * @param brandContext - The brand context string
 * @returns Enhanced system prompt with brand context
 */
export function enhanceSystemPromptWithBrandContext(
  systemPrompt: string,
  brandContext: string
): string {
  if (!brandContext.trim()) {
    return systemPrompt;
  }

  return systemPrompt + brandContext;
} 