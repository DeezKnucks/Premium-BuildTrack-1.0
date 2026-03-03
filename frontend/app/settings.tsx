import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { AnimatedTouchable } from '../components/AnimatedTouchable';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const SettingRow = ({ icon, title, subtitle, onPress, rightElement, danger = false }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={[styles.settingIcon, { backgroundColor: danger ? Colors.error + '20' : Colors.primary + '20' }]}>
        <MaterialIcons name={icon} size={22} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: danger ? Colors.error : colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightElement || <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.dark.card, Colors.dark.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <GlassCard style={styles.profileCard}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>{user?.full_name?.charAt(0) || 'U'}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.full_name}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.roleText, { color: Colors.primary }]}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <GlassCard>
          <SettingRow
            icon={isDark ? 'light-mode' : 'dark-mode'}
            title="Dark Mode"
            subtitle="Toggle dark/light theme"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleTheme();
                }}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </GlassCard>

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
        <GlassCard>
          <SettingRow
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive project updates"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setNotifications(v);
                }}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </GlassCard>

        {/* Privacy & Security */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PRIVACY & SECURITY</Text>
        <GlassCard>
          <SettingRow
            icon="location-on"
            title="Location Services"
            subtitle="For GPS tagging"
            rightElement={
              <Switch
                value={locationServices}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLocationServices(v);
                }}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="fingerprint"
            title="Biometric Authentication"
            subtitle="Use Face ID / Touch ID"
            rightElement={
              <Switch
                value={biometricAuth}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBiometricAuth(v);
                }}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow icon="lock" title="Change Password" onPress={() => {}} />
        </GlassCard>

        {/* Data & Storage */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA & STORAGE</Text>
        <GlassCard>
          <SettingRow
            icon="sync"
            title="Auto-Sync"
            subtitle="Sync data when online"
            rightElement={
              <Switch
                value={autoSync}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAutoSync(v);
                }}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow icon="storage" title="Clear Cache" subtitle="Free up storage space" onPress={() => {}} />
          <SettingRow icon="download" title="Download Offline Data" onPress={() => {}} />
        </GlassCard>

        {/* Support */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SUPPORT</Text>
        <GlassCard>
          <SettingRow icon="help" title="Help Center" onPress={() => {}} />
          <SettingRow icon="bug-report" title="Report a Bug" onPress={() => {}} />
          <SettingRow icon="feedback" title="Send Feedback" onPress={() => {}} />
          <SettingRow icon="info" title="About BuildTrack" subtitle="Version 1.0.0" onPress={() => {}} />
        </GlassCard>

        {/* Logout */}
        <GlassCard style={styles.logoutCard}>
          <SettingRow icon="logout" title="Logout" danger onPress={handleLogout} />
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, marginTop: Spacing.lg },
  profileAvatar: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  profileInitial: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  profileName: { fontSize: Typography.lg, fontWeight: Typography.bold },
  profileEmail: { fontSize: Typography.sm, marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: Spacing.sm },
  roleText: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, marginTop: Spacing.xl, marginBottom: Spacing.md, marginLeft: 4, letterSpacing: 1.5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(100,100,100,0.1)' },
  settingIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingInfo: { flex: 1, marginLeft: Spacing.md },
  settingTitle: { fontSize: Typography.base, fontWeight: Typography.semibold },
  settingSubtitle: { fontSize: Typography.sm, marginTop: 2 },
  logoutCard: { marginTop: Spacing.xl },
});
