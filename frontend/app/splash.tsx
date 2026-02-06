import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '../components/Logo';
import { Colors, Typography } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline fade in after logo
    setTimeout(() => {
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.secondary, Colors.secondaryDark, '#0A1128']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Logo size={150} />
          <Text style={styles.appName}>BuildTrack</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineAnim,
              transform: [
                {
                  translateY: taglineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.tagline}>Crush Overruns with AI</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Construction Management Pro</Text>
        </Animated.View>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: Typography['5xl'],
    fontWeight: Typography.black,
    color: '#FFF',
    marginTop: 24,
    letterSpacing: 2,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.primary,
    marginVertical: 16,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: Typography.sm,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: Typography.medium,
  },
});