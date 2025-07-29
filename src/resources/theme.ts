export const Colors = {
  // Brand Colors
  brandPrimary: 'rgb(123, 97, 255)',
  appBackground: 'rgb(24, 26, 32)',
  darkBackground: 'rgb(35, 36, 58)',
  brandSecondary: 'rgba(123, 97, 255, 0.8)',
  
  // UI Colors
  cardBackground: 'rgb(45, 46, 68)',
  pureBlack: '#000000',
  textOnDark: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  success: 'rgb(52, 199, 89)',
  warning: 'rgb(255, 204, 0)',
  error: 'rgb(255, 59, 48)',
  
  // Button Colors
  buttonPrimary: 'rgb(123, 97, 255)',
  buttonSecondary: 'rgb(60, 61, 83)',
  buttonText: '#FFFFFF',
  
  // Call Interface Colors
  callActive: 'rgb(52, 199, 89)',
  callMuted: 'rgb(255, 204, 0)',
  callEnd: 'rgb(255, 59, 48)',
  speakerActive: 'rgb(123, 97, 255)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  round: 9999,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};