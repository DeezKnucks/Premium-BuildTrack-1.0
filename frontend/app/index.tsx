import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [navigationReady, setNavigationReady] = useState(false);
  
  // Animation values for splash screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  // Run splash animation on mount
  useEffect(() => {
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

    // Minimum splash display time (2 seconds)
    const splashTimer = setTimeout(() => {
      setNavigationReady(true);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  // Navigation logic - only runs after splash and auth check complete
  useEffect(() => {
    if (!navigationReady || isLoading) {
      return; // Wait for both splash timer and auth loading
    }

    const performNavigation = async () => {
      try {
        console.log('Index: Navigation ready, checking auth...', { isAuthenticated });
        
        // Fade out splash before navigating
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(async () => {
          setShowSplash(false);
          
          // If user is already authenticated, go straight to dashboard
          if (isAuthenticated) {
            console.log('Index: User authenticated, going to dashboard');
            router.replace('/(tabs)/dashboard');
            return;
          }

          // Check if user has seen onboarding
          const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
          console.log('Index: hasSeenOnboarding =', hasSeenOnboarding);
          
          if (!hasSeenOnboarding) {
            // First time user - show onboarding
            console.log('Index: First time user, showing onboarding');
            router.replace('/onboarding');
          } else {
            // Returning user - show login
            console.log('Index: Returning user, showing login');
            router.replace('/(auth)/login');
          }
        });
      } catch (error) {
        console.error('Navigation error:', error);
        setShowSplash(false);
        router.replace('/(auth)/login');
      }
    };

    performNavigation();
  }, [navigationReady, isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#0F172A', '#0A1128']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <MaterialIcons name="construction" size={64} color="#FF6B35" />
          </View>
          <Text style={styles.appName}>BuildTrack</Text>
        </View>

        {/* Tagline */}
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
      </Animated.View>

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
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 24,
    letterSpacing: 2,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF6B35',
    textAlign: 'center',
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#FF6B35',
    marginVertical: 16,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
});
