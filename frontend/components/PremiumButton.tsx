import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { AnimatedTouchable } from './AnimatedTouchable';

interface PremiumButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  icon?: any;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  fullWidth?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  loading = false,
  icon,
  variant = 'primary',
  fullWidth = true,
  onPress,
  disabled,
  ...props
}) => {
  const handlePress = (e: any) => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.(e);
    }
  };

  const gradients = {
    primary: [Colors.primary, Colors.primaryDark],
    secondary: [Colors.secondary, Colors.secondaryDark],
    success: [Colors.success, '#059669'],
    warning: [Colors.warning, '#D97706'],
    error: [Colors.error, '#DC2626'],
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.buttonText}>Loading...</Text>
          </>
        ) : (
          <>
            {icon && (
              <MaterialIcons
                name={icon}
                size={24}
                color="#FFF"
                style={styles.icon}
              />
            )}
            <Text style={styles.buttonText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minHeight: 56,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: Typography.lg,
    fontWeight: Typography.extrabold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: Spacing.xs,
  },
});