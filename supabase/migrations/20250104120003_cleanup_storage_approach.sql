-- Clean up storage bucket and image_path column since we're using local assets
-- Remove the image_path column from cards table
ALTER TABLE cards DROP COLUMN IF EXISTS image_path;

-- Drop storage policies for card-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload card images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update card images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete card images" ON storage.objects;

-- Remove the storage bucket
DELETE FROM storage.buckets WHERE id = 'card-images';

-- Drop the index on image_path since the column no longer exists
DROP INDEX IF EXISTS idx_cards_image_path; 