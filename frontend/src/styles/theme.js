/**
 * Theme configuration for LínguaMedia
 * Matching the HTML implementation colors and styles
 */

export const theme = {
  colors: {
    // Background gradient
    backgroundStart: '#2b1f5c',
    backgroundEnd: '#1a1233',

    // Purple accent
    primary: '#7F00FF',
    primaryLight: '#9D4EDD',
    primaryGradient: ['#7F00FF', '#9D4EDD'],

    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',

    // UI elements
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    buttonHover: 'rgba(255, 255, 255, 0.2)',

    // Shadow/Glow
    glowPurple: 'rgba(127, 0, 255, 0.6)',
    glowPurpleLight: 'rgba(127, 0, 255, 0.3)',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },

  shadows: {
    glow: {
      shadowColor: '#7F00FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 40,
      elevation: 10,
    },
    glowButton: {
      shadowColor: '#7F00FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};

export default theme;
