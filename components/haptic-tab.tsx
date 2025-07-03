import React from 'react';
import { Pressable, View, Platform, Text } from 'react-native';
import type { PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { cn } from '@/lib/utils';

interface HapticTabProps extends PressableProps {
  children?: React.ReactNode;
}

export const HapticTab = ({ children, onPress, style, ...props }: HapticTabProps) => {
  const handlePress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const pressableStyle = [
    {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 12, // Increased padding for better touch target
      paddingHorizontal: 8,
      gap: 6, // Add gap between icon and text
    },
    typeof style === 'function' ? undefined : style
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface, // Use surface color from design system
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Pressable
        {...props}
        style={pressableStyle}
        onPress={handlePress}
        className="font-funnel-sans-medium" // Apply Funnel font to tab text
      >
        <View style={{ 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 4, // Specific gap between icon and text
          paddingTop: Platform.OS === 'ios' ? 2 : 0, // Slight adjustment for iOS
        }}>
          {children}
        </View>
      </Pressable>
    </View>
  );
}; 