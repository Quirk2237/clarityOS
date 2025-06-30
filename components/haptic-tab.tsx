import React from 'react';
import { Pressable, PressableProps } from 'react-native';

interface HapticTabProps extends PressableProps {
  children?: React.ReactNode;
}

export const HapticTab = ({ children, onPress, ...props }: HapticTabProps) => {
  return (
    <Pressable
      {...props}
      onPress={(event) => {
        // Add basic press feedback
        onPress?.(event);
      }}
    >
      {children}
    </Pressable>
  );
}; 