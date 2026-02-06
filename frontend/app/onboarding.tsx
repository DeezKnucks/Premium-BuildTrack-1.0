import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const [darkMode, setDarkMode] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'General Inquiry',
  });
  const [featureRequest, setFeatureRequest] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(contactForm.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/feedback/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      Alert.alert(
        'Success!',
        "Thank you for reaching out! We'll get back to you within 24 hours.",
        [
          {
            text: 'OK',
            onPress: () => {
              setContactForm({
                name: '',
                email: '',
                phone: '',
                message: '',
                type: 'General Inquiry',
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureSubmit = async () => {
    if (!featureRequest.trim()) {
      Alert.alert('Error', 'Please describe your feature request');
      return;
    }

    setLoading(true);
    try {
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/feedback/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_request: featureRequest }),
      });

      Alert.alert(
        'Thank You!',
        'Your feature request has been submitted. We review all feedback for our product roadmap!',
        [
          {
            text: 'OK',
            onPress: () => setFeatureRequest(''),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToDashboard = () => {
    router.replace('/(auth)/login');
  };

  const colors = darkMode
    ? { bg: '#0F0F23', card: '#1A1A2E', text: '#FFF', subtext: '#999' }
    : { bg: '#F5F5F5', card: '#FFF', text: '#000', subtext: '#666' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="construction" size={32} color="#FF6B35" />
          <Text style={[styles.logoText, { color: colors.text }]}>BuildTrack</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.darkModeToggle}
            onPress={() => setDarkMode(!darkMode)}
          >
            <MaterialIcons
              name={darkMode ? 'light-mode' : 'dark-mode'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: colors.card }]}
            onPress={handleSkipToDashboard}
          >
            <Text style={[styles.skipButtonText, { color: '#FF6B35' }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Founder Bio */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.heroSection}>
              {/* Headshot Placeholder */}
              <View style={styles.headshotContainer}>
                <View style={[styles.headshot, { backgroundColor: colors.card }]}>
                  <MaterialIcons name="person" size={80} color="#FF6B35" />
                </View>
              </View>

              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Hi, I'm [Your Name]
              </Text>
              <Text style={[styles.heroSubtitle, { color: '#FF6B35' }]}>Founder of BuildTrack</Text>

              <Text style={[styles.bioText, { color: colors.subtext }]}>
                Ex-contractor turned developer who's seen <Text style={{ color: '#F44336', fontWeight: 'bold' }}>22% overruns</Text> and{' '}
                <Text style={{ color: '#F44336', fontWeight: 'bold' }}>15+ hrs/week manual admin</Text>{' '}
                kill too many good projects firsthand.
              </Text>

              <View style={[styles.missionCard, { backgroundColor: colors.card }]}>
                <View style={styles.missionHeader}>
                  <MaterialIcons name="rocket-launch" size={24} color="#FF6B35" />
                  <Text style={[styles.missionTitle, { color: colors.text }]}>Our Mission</Text>
                </View>
                <Text style={[styles.missionText, { color: colors.subtext }]}>
                  I'm building the only construction PM app that predicts risks with AI, works
                  offline in the field, and syncs budgets real-time—unifying 5-7 fragmented
                  tools into one.
                </Text>
                <View style={styles.targetBadge}>
                  <MaterialIcons name="location-on" size={16} color="#4CAF50" />
                  <Text style={styles.targetText}>
                    For mid-market contractors ($5M-$500M projects) scaling nationally from Texas
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Section 2: Features Teaser */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What We're Building
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
              Better than Procore/Buildertrend: Field-tested for crews, AI-powered for PMs,
              profitability-focused for execs.
            </Text>

            <View style={styles.featuresGrid}>
              {[
                {
                  icon: 'psychology',
                  title: 'AI Risk Prediction',
                  description: 'Weather/GPS analysis prevents delays before they happen',
                  color: '#2196F3',
                },
                {
                  icon: 'camera-alt',
                  title: 'Offline GPS Media',
                  description: 'Voice logging + timestamped photos work without internet',
                  color: '#4CAF50',
                },
                {
                  icon: 'sync',
                  title: 'Auto-Scheduling',
                  description: 'QuickBooks sync + critical path optimization',
                  color: '#FF9800',
                },
              ].map((feature, index) => (
                <View key={index} style={[styles.featureCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                    <MaterialIcons name={feature.icon as any} size={32} color={feature.color} />
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: colors.subtext }]}>
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <Text style={[styles.ctaText, { color: colors.subtext }]}>
                Join 500+ contractors in beta
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.ctaButtonPrimary}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.ctaButtonPrimaryText}>Sign Up Free</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ctaButtonSecondary, { borderColor: '#FF6B35' }]}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={styles.ctaButtonSecondaryText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section 3: Contact & Feedback */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Get In Touch</Text>

            {/* Contact Form */}
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Contact Us</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.card }]}
                placeholder="Your Name *"
                placeholderTextColor={colors.subtext}
                value={contactForm.name}
                onChangeText={(text) => setContactForm({ ...contactForm, name: text })}
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.card }]}
                placeholder="Email Address *"
                placeholderTextColor={colors.subtext}
                value={contactForm.email}
                onChangeText={(text) => setContactForm({ ...contactForm, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.card }]}
                placeholder="Phone Number"
                placeholderTextColor={colors.subtext}
                value={contactForm.phone}
                onChangeText={(text) => setContactForm({ ...contactForm, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.card }]}
                placeholder="Your Message *"
                placeholderTextColor={colors.subtext}
                value={contactForm.message}
                onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleContactSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Feature Request */}
            <View style={[styles.formCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Feature Requests</Text>
              <Text style={[styles.formSubtitle, { color: colors.subtext }]}>
                What do you need in your dream PM app?
              </Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.card }]}
                placeholder="Describe your ideal feature..."
                placeholderTextColor={colors.subtext}
                value={featureRequest}
                onChangeText={setFeatureRequest}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleFeatureSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialIcons name="lightbulb" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Social Proof */}
            <View style={[styles.socialProofCard, { backgroundColor: colors.card }]}>
              <MaterialIcons name="verified" size={32} color="#4CAF50" />
              <Text style={[styles.socialProofTitle, { color: colors.text }]}>
                Built For Construction Professionals
              </Text>
              <Text style={[styles.socialProofText, { color: colors.subtext }]}>
                General contractors, subs, and modular builders crushing overruns nationwide.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeToggle: {
    padding: 8,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
  },
  headshotContainer: {
    marginBottom: 24,
  },
  headshot: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FF6B35',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  missionCard: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF5020',
    padding: 12,
    borderRadius: 12,
  },
  targetText: {
    fontSize: 14,
    color: '#4CAF50',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresGrid: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ctaButtonPrimary: {
    flex: 1,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ctaButtonSecondary: {
    flex: 1,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonSecondaryText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#0F0F23',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#0F0F23',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  socialProofCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  socialProofTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialProofText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});