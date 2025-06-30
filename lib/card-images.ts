// Card image mappings - maps card slugs to their local SVG assets
const cardImages = {
	'purpose': require('@/assets/card-images/purpose.svg'),
	'positioning': require('@/assets/card-images/positioning.svg'),
	'personality': require('@/assets/card-images/personality.svg'),
	'product-market-fit': require('@/assets/card-images/product-market-fit.svg'),
	'perception': require('@/assets/card-images/perception.svg'),
	'presentation': require('@/assets/card-images/presentation.svg'),
	'proof': require('@/assets/card-images/proof.svg'),
};

// Type-safe function to get card image by slug
export function getCardImage(slug: string): any | null {
	return cardImages[slug as keyof typeof cardImages] || null;
}

// Get all available card image slugs
export function getAvailableCardImageSlugs(): string[] {
	return Object.keys(cardImages);
}

export default cardImages; 