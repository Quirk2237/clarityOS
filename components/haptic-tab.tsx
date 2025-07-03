import React from 'react';
import { Pressable, View, Platform } from 'react-native';
import type { PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

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
      paddingVertical: 8,
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
      >
        {children}
      </Pressable>
    </View>
  );
}; 