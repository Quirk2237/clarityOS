-- Add image_url column to cards table
ALTER TABLE cards 
ADD COLUMN image_url TEXT;

-- Add a comment to document the purpose of the column
COMMENT ON COLUMN cards.image_url IS 'URL or path to the card image/cover image';

-- Create an index for better performance when filtering by image presence
CREATE INDEX IF NOT EXISTS idx_cards_image_url ON cards(image_url) WHERE image_url IS NOT NULL; 