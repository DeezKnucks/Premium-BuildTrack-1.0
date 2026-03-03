import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import api from '../services/api';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    job_title: '',
    avatar_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getUserProfile();
      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        job_title: data.job_title || '',
        avatar_url: data.avatar_url || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    
    try {
      await api.updateUserProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        company: profile.company,
        job_title: profile.job_title,
        avatar_url: profile.avatar_url,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setProfile({ ...profile, avatar_url: `data:image/jpeg;base64,${result.assets[0].base64}` });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{profile.full_name?.charAt(0) || 'U'}</Text>
              </LinearGradient>
            )}
            <View style={styles.editAvatarBadge}>
              <MaterialIcons name="camera-alt" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: Colors.primary }]}>Change Photo</Text>
        </View>

        {/* Form Fields */}
        <GlassCard style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name *</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <MaterialIcons name="person" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
            <View style={[styles.inputContainer, styles.inputDisabled, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <MaterialIcons name="email" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textSecondary }]}
                value={profile.email}
                editable={false}
              />
              <MaterialIcons name="lock" size={16} color={colors.textSecondary} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone Number</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Company</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <MaterialIcons name="business" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your company name"
                placeholderTextColor={colors.textSecondary}
                value={profile.company}
                onChangeText={(text) => setProfile({ ...profile, company: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Job Title</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <MaterialIcons name="work" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your job title"
                placeholderTextColor={colors.textSecondary}
                value={profile.job_title}
                onChangeText={(text) => setProfile({ ...profile, job_title: text })}
              />
            </View>
          </View>
        </GlassCard>

        {/* Role Badge */}
        <GlassCard style={styles.roleCard}>
          <View style={styles.roleInfo}>
            <MaterialIcons name="verified-user" size={24} color={Colors.primary} />
            <View style={styles.roleText}>
              <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>Account Role</Text>
              <Text style={[styles.roleValue, { color: colors.text }]}>{user?.role?.toUpperCase() || 'USER'}</Text>
            </View>
          </View>
          <Text style={[styles.roleHint, { color: colors.textSecondary }]}>Contact admin to change role</Text>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    ...Shadows.lg,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: '#FFF' },
  saveButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  saveButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  changePhotoText: { marginTop: Spacing.sm, fontSize: Typography.sm, fontWeight: '600' },
  formCard: { padding: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: Typography.sm, fontWeight: '600', marginBottom: Spacing.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: Spacing.md },
  inputDisabled: { opacity: 0.6 },
  input: { flex: 1, paddingVertical: Spacing.md, fontSize: Typography.base, marginLeft: Spacing.sm },
  roleCard: { padding: Spacing.lg, marginTop: Spacing.lg },
  roleInfo: { flexDirection: 'row', alignItems: 'center' },
  roleText: { marginLeft: Spacing.md },
  roleLabel: { fontSize: Typography.sm },
  roleValue: { fontSize: Typography.lg, fontWeight: Typography.bold },
  roleHint: { fontSize: Typography.xs, marginTop: Spacing.sm },
});
