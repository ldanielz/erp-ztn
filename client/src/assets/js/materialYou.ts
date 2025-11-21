/**
 * Material You (Material Design 3) Color Palette
 * Implements a modern, accessible color scheme with tonal variations
 */

export const materialYouPalette = {
  // Primary - Bold, dynamic color (Google Blue-inspired)
  primary: {
    primary: '#0B57D4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D3E3FD',
    onPrimaryContainer: '#001B3D'
  },
  // Secondary - Complements primary (Google Teal-inspired)
  secondary: {
    secondary: '#5E7CE0',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8EFFE',
    onSecondaryContainer: '#191D47'
  },
  // Tertiary - For accents and highlights (Google Orange-inspired)
  tertiary: {
    tertiary: '#E8830B',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE4C7',
    onTertiaryContainer: '#3D2200'
  },
  // Neutral colors for text, backgrounds, surfaces
  neutral: {
    background: '#FFFBFE',
    onBackground: '#1C1B1F',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#ECE0F5',
    onSurfaceVariant: '#49454E',
    outline: '#79747E',
    outlineVariant: '#CAC4CF'
  },
  // Status colors
  success: '#1B8D20',
  onSuccess: '#FFFFFF',
  error: '#B3261E',
  onError: '#FFFFFF',
  warning: '#F9AB00',
  info: '#0B57D4'
}

export const getChartColors = () => ({
  primary: materialYouPalette.primary.primary,
  secondary: materialYouPalette.secondary.secondary,
  tertiary: materialYouPalette.tertiary.tertiary,
  success: materialYouPalette.success,
  error: materialYouPalette.error,
  warning: materialYouPalette.warning
})
