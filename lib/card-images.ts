import { supabase } from "@/config/supabase";

// Legacy card image mappings - fallback for cards without image_url
const fallbackCardImages = {
	'purpose': require('@/assets/card-images/purpose.svg'),
	'positioning': require('@/assets/card-images/positioning.svg'),
	'personality': require('@/assets/card-images/personality.svg'),
	'product-market-fit': require('@/assets/card-images/product-market-fit.svg'),
	'perception': require('@/assets/card-images/perception.svg'),
	'presentation': require('@/assets/card-images/presentation.svg'),
	'proof': require('@/assets/card-images/proof.svg'),
};

// Get the public URL for a card image from Supabase storage
export function getCardImageUrl(fileName: string): string {
	const { data } = supabase.storage
		.from('card-images')
		.getPublicUrl(fileName);
	
	return data.publicUrl;
}

// Type-safe function to get card image - prioritizes database image_url over local assets
export function getCardImage(imageUrl: string | null, slug: string): string | any | null {
	// If we have a database image URL, use it
	if (imageUrl) {
		return imageUrl;
	}
	
	// Otherwise, fall back to local assets
	return fallbackCardImages[slug as keyof typeof fallbackCardImages] || null;
}

// Legacy function for backward compatibility
export function getFallbackCardImage(slug: string): any | null {
	return fallbackCardImages[slug as keyof typeof fallbackCardImages] || null;
}

// Get all available card image slugs
export function getAvailableCardImageSlugs(): string[] {
	return Object.keys(fallbackCardImages);
}

// Upload a card image to Supabase storage
export async function uploadCardImage(file: File, fileName: string) {
	const { data, error } = await supabase.storage
		.from('card-images')
		.upload(fileName, file, {
			cacheControl: '3600',
			upsert: true
		});

	if (error) {
		console.error('Error uploading card image:', error);
		return { data: null, error };
	}

	return { data, error: null };
}

// Delete a card image from Supabase storage
export async function deleteCardImage(fileName: string) {
	const { data, error } = await supabase.storage
		.from('card-images')
		.remove([fileName]);

	return { data, error };
}

export default fallbackCardImages; 