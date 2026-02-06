// BuildTrack Premium Design System

export const Colors = {
  // Primary Brand Colors
  primary: '#F97316', // Construction Orange
  primaryDark: '#EA580C',
  primaryLight: '#FB923C',
  
  // Secondary Brand Colors
  secondary: '#1E3A8A', // Deep Blue
  secondaryDark: '#1E40AF',
  secondaryLight: '#3B82F6',
  
  // Dark Mode
  dark: {
    bg: '#0A0E1A',
    bgSecondary: '#111827',
    card: '#1F2937',
    cardGlass: 'rgba(31, 41, 55, 0.7)',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
  },
  
  // Light Mode
  light: {
    bg: '#F3F4F6',
    bgSecondary: '#FFFFFF',
    card: '#FFFFFF',
    cardGlass: 'rgba(255, 255, 255, 0.7)',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Status Colors
  active: '#10B981',
  pending: '#F59E0B',
  blocked: '#EF4444',
  completed: '#8B5CF6',
};

export const Typography = {
  // Font Families
  primary: 'System', // Will use Inter/SF Pro on iOS, Roboto on Android
  
  // Font Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  
  // Font Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const BorderRadius = {
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  // Glassmorphism Shadow
  glass: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const Gradients = {
  primary: ['#F97316', '#EA580C'],
  secondary: ['#1E3A8A', '#3B82F6'],
  dark: ['#0A0E1A', '#111827'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  card: ['rgba(31, 41, 55, 0.8)', 'rgba(31, 41, 55, 0.4)'],
};

export const Animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  scale: {
    pressed: 0.95,
    hover: 1.02,
  },
};

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.base,
  headerHeight: 60,
  tabBarHeight: 80,
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Gradients,
  Animations,
  Layout,
};