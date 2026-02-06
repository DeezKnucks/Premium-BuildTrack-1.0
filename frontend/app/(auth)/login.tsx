import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logo } from '../../components/Logo';
import { PremiumInput } from '../../components/PremiumInput';
import { PremiumButton } from '../../components/PremiumButton';
import { SuccessToast } from '../../components/SuccessToast';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 1000);
    } catch (error: any) {
      setErrors({ ...errors, password: error.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SuccessToast
        message="Login successful! Welcome back 🎉"
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        withConfetti
      />
      
      <LinearGradient
        colors={[Colors.secondary, Colors.secondaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={100} />
            <Text style={styles.title}>BuildTrack</Text>
            <Text style={styles.subtitle}>Construction Management Pro</Text>
          </View>

          <View style={styles.form}>
            <PremiumInput
              label="EMAIL"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <PremiumInput
              label="PASSWORD"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            <PremiumButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              icon="login"
              variant="primary"
            />

            <PremiumButton
              title="Create Account"
              onPress={() => router.push('/(auth)/register')}
              variant="secondary"
              icon="person-add"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize: Typography['4xl'],
    fontWeight: Typography.black,
    color: '#FFF',
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.sm,
  },
  form: {
    width: '100%',
    gap: Spacing.base,
  },
});