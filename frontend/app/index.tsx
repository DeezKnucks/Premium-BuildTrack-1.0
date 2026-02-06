import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      console.log('Index: hasSeenOnboarding=', hasSeenOnboarding, 'isLoading=', isLoading, 'isAuthenticated=', isAuthenticated);
      
      if (!isLoading) {
        if (!hasSeenOnboarding) {
          // First time user - show onboarding
          console.log('Index: Navigating to onboarding');
          router.replace('/onboarding');
        } else if (isAuthenticated) {
          console.log('Index: Navigating to dashboard');
          router.replace('/(tabs)/dashboard');
        } else {
          console.log('Index: Navigating to login');
          router.replace('/(auth)/login');
        }
        setNavigationAttempted(true);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (isLoading || checkingOnboarding || !navigationAttempted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.text}>Loading BuildTrack...</Text>
      </View>
    );
  }

  return null;
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
