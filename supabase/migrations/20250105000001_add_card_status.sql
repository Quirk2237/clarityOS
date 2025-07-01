-- Add card_status enum type
DO $$ BEGIN
    CREATE TYPE card_status AS ENUM ('open', 'coming_soon');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status card_status DEFAULT 'coming_soon';

-- Update existing cards: set Purpose to 'open' and all others to 'coming_soon'
UPDATE cards SET status = 'open' WHERE slug = 'purpose';
UPDATE cards SET status = 'coming_soon' WHERE slug != 'purpose';

-- Make status column NOT NULL after setting values
ALTER TABLE cards ALTER COLUMN status SET NOT NULL; 