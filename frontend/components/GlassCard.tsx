import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, gradient = false }) => {
  const { isDark, colors } = useTheme();

  if (gradient) {
    return (
      <LinearGradient
        colors={isDark ? ['rgba(31, 41, 55, 0.8)', 'rgba(31, 41, 55, 0.4)'] : ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: colors.border }, Shadows.glass, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardGlass,
          borderColor: colors.border,
        },
        Shadows.glass,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});