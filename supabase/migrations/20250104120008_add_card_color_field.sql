-- Add color column to cards table
ALTER TABLE cards 
ADD COLUMN color TEXT DEFAULT '#ACFF64';

-- Add a comment to document the purpose of the column
COMMENT ON COLUMN cards.color IS 'Background color for the card in hex format';

-- Create an index for better performance when filtering by color
CREATE INDEX IF NOT EXISTS idx_cards_color ON cards(color);

-- Set default colors for existing cards based on their order
UPDATE cards 
SET color = CASE 
    WHEN slug = 'purpose' THEN '#ACFF64'
    WHEN slug = 'positioning' THEN '#ACFF64'
    WHEN slug = 'personality' THEN '#ACFF64'
    WHEN slug = 'product-market-fit' THEN '#ACFF64'
    WHEN slug = 'perception' THEN '#ACFF64'
    WHEN slug = 'presentation' THEN '#ACFF64'
    WHEN slug = 'proof' THEN '#ACFF64'
    ELSE '#ACFF64'
END
WHERE color IS NULL OR color = '#ACFF64'; 