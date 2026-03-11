/**
 * Vaporous Greenhouse Theme — glassmorphism dark UI design tokens.
 */

export const colors = {
  // Core backgrounds
  bgDeep: '#0a0f0d',
  bgCard: 'rgba(255, 255, 255, 0.05)',
  bgCardHover: 'rgba(255, 255, 255, 0.08)',
  bgInput: 'rgba(255, 255, 255, 0.07)',

  // Accent
  mint: '#b2ffda',
  mintDim: 'rgba(178, 255, 218, 0.15)',
  mintGlow: 'rgba(178, 255, 218, 0.4)',

  // Borders
  border: 'rgba(255, 255, 255, 0.10)',
  borderLight: 'rgba(255, 255, 255, 0.06)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textTertiary: 'rgba(255, 255, 255, 0.30)',
  textMuted: 'rgba(255, 255, 255, 0.18)',

  // Status
  green: '#4ade80',
  greenDim: 'rgba(74, 222, 128, 0.15)',
  yellow: '#facc15',
  yellowDim: 'rgba(250, 204, 21, 0.15)',
  red: '#f87171',
  redDim: 'rgba(248, 113, 113, 0.15)',

  // Data colors
  tempColor: '#ff8a80',
  humidityColor: '#80d8ff',

  // Gradient stops for backgrounds
  gradientStart: '#0a0f0d',
  gradientMid: '#0d1a15',
  gradientEnd: '#0a0f0d',
};

export const glassCard = {
  backgroundColor: colors.bgCard,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  hero: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -4,
  },
  h1: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  data: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
};
