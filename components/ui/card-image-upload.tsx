import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from './button';
import { Text } from './text';
import { uploadCardImage, getCardImageUrl } from '@/lib/card-images';
import { supabase } from '@/config/supabase';

interface CardImageUploadProps {
  cardId: string;
  cardSlug: string;
  currentImageUrl?: string | null;
  onImageUploaded?: (newImageUrl: string) => void;
}

export function CardImageUpload({ 
  cardId, 
  cardSlug, 
  currentImageUrl, 
  onImageUploaded 
}: CardImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async () => {
    try {
      setUploading(true);
      
      // In a real app, this would open a file picker
      // For now, we'll show how it would work
      Alert.alert(
        "Image Upload",
        "In a real implementation, this would open a file picker to select an image. The selected image would be uploaded to the card-images storage bucket.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Simulate Upload",
            onPress: async () => {
              // Simulate uploading a new image URL
              const simulatedImageUrl = `https://via.placeholder.com/400x300/10B981/FFFFFF?text=${cardSlug.toUpperCase()}`;
              
              // Update the card in the database with the new image URL
              const { error } = await supabase
                .from('cards')
                .update({ image_url: simulatedImageUrl })
                .eq('id', cardId);
              
              if (error) {
                console.error('Error updating card image:', error);
                Alert.alert('Error', 'Failed to update card image');
              } else {
                onImageUploaded?.(simulatedImageUrl);
                Alert.alert('Success', 'Card image updated successfully!');
              }
            }
          }
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="p-4 border border-gray-300 rounded-lg">
      <Text className="text-lg font-semibold mb-2">Card Image</Text>
      
      {currentImageUrl ? (
        <Text className="text-sm text-gray-600 mb-2">
          Current: {currentImageUrl.length > 50 ? `${currentImageUrl.substring(0, 50)}...` : currentImageUrl}
        </Text>
      ) : (
        <Text className="text-sm text-gray-500 mb-2">
          No image set - using fallback
        </Text>
      )}
      
      <Button
        onPress={handleImageUpload}
        disabled={uploading}
        className={uploading ? 'opacity-50' : ''}
      >
        <Text className="text-white">
          {uploading ? 'Uploading...' : 'Upload New Image'}
        </Text>
      </Button>
      
      <Text className="text-xs text-gray-400 mt-2">
        Supported formats: JPEG, PNG, WebP, SVG (max 5MB)
      </Text>
    </View>
  );
} 