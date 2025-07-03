import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors } from '@/constants/colors';

interface TabBarBackgroundProps extends ViewProps {}

export default function TabBarBackground({ style, ...props }: TabBarBackgroundProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface, // Use surface color from design system
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
        style,
      ]}
      {...props}
    />
  );
} 