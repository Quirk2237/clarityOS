-- Add sample image URLs to some cards
-- These would be populated when images are uploaded to the card-images storage bucket

UPDATE cards 
SET image_url = 'https://via.placeholder.com/400x300/ACFF64/000000?text=Purpose'
WHERE slug = 'purpose';

UPDATE cards 
SET image_url = 'https://via.placeholder.com/400x300/E879F9/FFFFFF?text=Positioning'
WHERE slug = 'positioning';

UPDATE cards 
SET image_url = 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Personality'
WHERE slug = 'personality';

-- The other cards will use the fallback local images until proper images are uploaded 