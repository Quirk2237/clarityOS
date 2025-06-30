# Card Image Management

This document explains how card images are managed in the application, including the storage setup and usage.

## Overview

The application supports two ways to display card images:
1. **Database Images**: Images stored in Supabase storage and referenced via `image_url` in the card table
2. **Fallback Images**: Local SVG assets used when no database image is available

## Storage Setup

### Supabase Storage Bucket

A public storage bucket called `card-images` has been created with the following configuration:
- **Bucket ID**: `card-images`
- **Public Access**: Yes (images are publicly accessible)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`

### RLS Policies

The following Row Level Security policies are in place:
- **Public Read**: Anyone can view card images
- **Authenticated Upload**: Only authenticated users can upload images
- **Authenticated Update**: Only authenticated users can update images  
- **Authenticated Delete**: Only authenticated users can delete images

## Database Schema

The `cards` table includes an `image_url` column:
```sql
ALTER TABLE cards ADD COLUMN image_url TEXT;
```

## Usage

### Displaying Card Images

Cards automatically use the appropriate image source:

```typescript
// The getCardImage function handles the logic
const imageSource = getCardImage(card.image_url, card.slug);

// Returns either:
// - The database image_url (if available)
// - A local fallback SVG asset
// - null (if neither is available)
```

### Uploading Card Images

Use the `CardImageUpload` component for managing card images:

```typescript
import { CardImageUpload } from '@/components/ui/card-image-upload';

<CardImageUpload
  cardId={card.id}
  cardSlug={card.slug}
  currentImageUrl={card.image_url}
  onImageUploaded={(newUrl) => {
    // Handle successful upload
    console.log('New image URL:', newUrl);
  }}
/>
```

### Programmatic Image Management

The card-images library provides several utilities:

```typescript
import { 
  uploadCardImage, 
  deleteCardImage, 
  getCardImageUrl 
} from '@/lib/card-images';

// Upload an image file
const { data, error } = await uploadCardImage(file, 'card-purpose.jpg');

// Get public URL for an image
const publicUrl = getCardImageUrl('card-purpose.jpg');

// Delete an image
await deleteCardImage('card-purpose.jpg');
```

## File Organization

### Local Fallback Images
Located in `/assets/card-images/`:
- `purpose.svg`
- `positioning.svg`
- `personality.svg`
- `product-market-fit.svg`
- `perception.svg`
- `presentation.svg`
- `proof.svg`

### Storage Structure
Images in the `card-images` bucket should follow naming conventions:
- `card-{slug}.{extension}` (e.g., `card-purpose.jpg`)
- Descriptive filenames are recommended for easier management

## Implementation Details

### Priority Order
1. **Database `image_url`**: If the card has an `image_url`, use it
2. **Local Fallback**: If no `image_url`, try to find a local SVG asset by slug
3. **No Image**: Display a fallback UI element

### Error Handling
- Images that fail to load will trigger the `onError` callback
- The UI gracefully falls back to the next available option
- Error details are logged to the console for debugging

### Sample Data
Some cards have been populated with sample image URLs for testing:
- Purpose card: Placeholder image with branded colors
- Positioning card: Purple-themed placeholder
- Personality card: Blue-themed placeholder

## Best Practices

1. **Image Optimization**: 
   - Use appropriate formats (WebP for photos, SVG for illustrations)
   - Optimize file sizes before uploading
   - Consider different screen densities

2. **Naming Conventions**:
   - Use descriptive, consistent filenames
   - Include the card slug in the filename
   - Use lowercase with hyphens

3. **Error Handling**:
   - Always provide fallback options
   - Test image loading on different network conditions
   - Monitor error logs for broken images

4. **Security**:
   - Validate file types before upload
   - Sanitize filenames
   - Monitor storage usage and costs

## Future Enhancements

Potential improvements to consider:
- Image resizing/optimization on upload
- Multiple image sizes for different screen densities
- Image caching strategies
- Bulk image management interface
- Integration with external image services 