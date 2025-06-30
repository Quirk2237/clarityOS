-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-images',
  'Card Images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Create RLS policies for the card-images bucket
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