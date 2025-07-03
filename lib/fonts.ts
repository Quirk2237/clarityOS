import { useFonts } from 'expo-font';

export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    'FunnelSans-Regular': require('../assets/fonts/FunnelSans-Regular.ttf'),
    'FunnelSans-Medium': require('../assets/fonts/FunnelSans-Medium.ttf'),
    'FunnelSans-Bold': require('../assets/fonts/FunnelSans-Bold.ttf'),
    'FunnelDisplay-Regular': require('../assets/fonts/FunnelDisplay-Regular.ttf'),
    'FunnelDisplay-Bold': require('../assets/fonts/FunnelDisplay-Bold.ttf'),
  });

  return fontsLoaded;
}

export const fontFamilies = {
  funnelSans: {
    regular: 'FunnelSans-Regular',
    medium: 'FunnelSans-Medium',
    bold: 'FunnelSans-Bold',
  },
  funnelDisplay: {
    regular: 'FunnelDisplay-Regular',
    bold: 'FunnelDisplay-Bold',
  },
} as const; 