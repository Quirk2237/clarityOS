-- Ensure card images setup is properly applied
-- This migration checks if the setup exists and creates it if it doesn't

-- Add image_url column to cards table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE cards ADD COLUMN image_url TEXT;
        COMMENT ON COLUMN cards.image_url IS 'URL or path to the card image/cover image';
        CREATE INDEX IF NOT EXISTS idx_cards_image_url ON cards(image_url) WHERE image_url IS NOT NULL;
    END IF;
END $$;

-- Ensure storage bucket exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'card-images'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'card-images',
            'Card Images',
            true,
            5242880, -- 5MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
        );
    END IF;
END $$;

-- Ensure RLS policies exist for the card-images bucket
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Card images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update card images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete card images" ON storage.objects;

    -- Create the policies
    CREATE POLICY "Card images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'card-images');

    CREATE POLICY "Authenticated users can upload card images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'card-images' 
        AND auth.role() = 'authenticated'
    );

    CREATE POLICY "Authenticated users can update card images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'card-images' 
        AND auth.role() = 'authenticated'
    );

    CREATE POLICY "Authenticated users can delete card images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'card-images' 
        AND auth.role() = 'authenticated'
    );
END $$;

-- Add sample image URLs if they don't exist
UPDATE cards 
SET image_url = 'https://via.placeholder.com/400x300/ACFF64/000000?text=Purpose'
WHERE slug = 'purpose' AND (image_url IS NULL OR image_url = '');

UPDATE cards 
SET image_url = 'https://via.placeholder.com/400x300/E879F9/FFFFFF?text=Positioning'
WHERE slug = 'positioning' AND (image_url IS NULL OR image_url = '');

UPDATE cards 
SET image_url = 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Personality'
WHERE slug = 'personality' AND (image_url IS NULL OR image_url = ''); 