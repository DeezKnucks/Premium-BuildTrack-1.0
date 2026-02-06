import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface PremiumInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    glowAnim.stopAnimation();
    props.onBlur?.(e);
  };

  const underlineColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, Colors.primary],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.card,
            },
            props.style,
          ]}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Animated.View
          style={[
            styles.underline,
            {
              backgroundColor: underlineColor,
            },
          ]}
        />
        {isFocused && (
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
              },
            ]}
          >
            <LinearGradient
              colors={[Colors.primary + '00', Colors.primary + '80', Colors.primary + '00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 56,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.base,
    borderRadius: BorderRadius.base,
    fontWeight: Typography.medium,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: BorderRadius.base,
    borderBottomRightRadius: BorderRadius.base,
  },
  glow: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 8,
  },
  error: {
    fontSize: Typography.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontWeight: Typography.medium,
  },
});