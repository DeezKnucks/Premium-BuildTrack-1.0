import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [navigationAttempted, setNavigationAttempted] = useState(false);

  useEffect(() => {
    console.log('Index: isLoading=', isLoading, 'isAuthenticated=', isAuthenticated);
    
    if (!isLoading && !navigationAttempted) {
      setNavigationAttempted(true);
      console.log('Index: Attempting navigation...');
      
      setTimeout(() => {
        if (isAuthenticated) {
          console.log('Index: Navigating to dashboard');
          router.replace('/(tabs)/dashboard');
        } else {
          console.log('Index: Navigating to login');
          router.replace('/(auth)/login');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigationAttempted]);

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
