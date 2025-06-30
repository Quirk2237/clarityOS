import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

// Map common SF Symbol names to Ionicons
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'house.fill': 'home',
  'chart.bar.fill': 'bar-chart',
  'gear': 'settings-outline',
  'square': 'square-outline',
  'square.fill': 'square',
  // Add more mappings as needed
};

export function IconSymbol({ name, size = 24, color }: IconSymbolProps) {
  const ioniconsName = iconMap[name] || 'help-outline';
  
  return (
    <Ionicons 
      name={ioniconsName} 
      size={size} 
      color={color} 
    />
  );
} 