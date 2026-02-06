import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      checkAndNavigate();
    }
  }, [isLoading, isAuthenticated]);

  const checkAndNavigate = async () => {
    try {
      console.log('Index: Checking navigation...', { isAuthenticated, isLoading });
      
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
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to login on error
      router.replace('/(auth)/login');
    } finally {
      setCheckingOnboarding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.text}>Loading BuildTrack...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
});
