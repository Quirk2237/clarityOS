import React from 'react';
import { View, ViewProps } from 'react-native';

interface TabBarBackgroundProps extends ViewProps {}

export default function TabBarBackground({ style, ...props }: TabBarBackgroundProps) {
  return (
    <View
      style={[
        {
          backgroundColor: '#1A1A1A', // ClarityOS dark background
        },
        style,
      ]}
      {...props}
    />
  );
} 