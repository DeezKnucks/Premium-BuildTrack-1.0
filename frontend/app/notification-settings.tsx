import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { usePushNotifications, NotificationPreferences } from '../services/PushNotificationService';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    isPermissionGranted,
    unreadCount,
    preferences,
    requestPermissions,
    updatePreferences,
    markAllAsRead,
    clearAll,
  } = usePushNotifications();

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    Haptics.selectionAsync();
    updatePreferences({ [key]: value });
  };

  const handleRequestPermissions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await requestPermissions();
  };

  const renderToggle = (
    icon: string,
    title: string,
    description: string,
    key: keyof NotificationPreferences,
    color: string = Colors.primary
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleInfo}>
        <View style={[styles.toggleIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={preferences[key] as boolean}
        onValueChange={(value) => handleToggle(key, value)}
        trackColor={{ false: colors.border, true: color }}
        thumbColor="#FFF"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Card */}
        {!isPermissionGranted && (
          <GlassCard style={styles.permissionCard}>
            <MaterialIcons name="notifications-off" size={32} color={Colors.warning} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>
              Enable Notifications
            </Text>
            <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
              Get important safety alerts, task reminders, and project updates.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermissions}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>Enable Notifications</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Master Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          <GlassCard style={styles.toggleCard}>
            {renderToggle(
              'notifications',
              'All Notifications',
              'Enable or disable all notifications',
              'enabled',
              Colors.primary
            )}
          </GlassCard>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>
          <GlassCard style={styles.toggleCard}>
            {renderToggle(
              'warning',
              'Safety Alerts',
              'Fall detection, impact, and emergency alerts',
              'safetyAlerts',
              '#EF4444'
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'alarm',
              'Task Reminders',
              'Upcoming deadlines and task notifications',
              'taskReminders',
              Colors.warning
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'folder',
              'Project Updates',
              'Changes to projects you\'re involved in',
              'projectUpdates',
              Colors.secondary
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'chat',
              'Team Messages',
              'New messages from team members',
              'teamMessages',
              Colors.success
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'cloud',
              'Weather Alerts',
              'Weather conditions affecting work sites',
              'weatherAlerts',
              '#60A5FA'
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'attach-money',
              'Budget Warnings',
              'Budget overruns and financial alerts',
              'budgetWarnings',
              Colors.error
            )}
          </GlassCard>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          <GlassCard style={styles.toggleCard}>
            {renderToggle(
              'volume-up',
              'Sound',
              'Play sound for notifications',
              'soundEnabled',
              Colors.primary
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'vibration',
              'Vibration',
              'Vibrate for notifications',
              'vibrationEnabled',
              Colors.primary
            )}
            <View style={styles.toggleDivider} />
            {renderToggle(
              'bedtime',
              'Quiet Hours',
              'Mute notifications during set hours',
              'quietHoursEnabled',
              Colors.secondary
            )}
          </GlassCard>
          
          {preferences.quietHoursEnabled && (
            <GlassCard style={styles.quietHoursCard}>
              <Text style={[styles.quietHoursTitle, { color: colors.text }]}>
                Quiet Hours: {preferences.quietHoursStart}:00 - {preferences.quietHoursEnd}:00
              </Text>
              <Text style={[styles.quietHoursText, { color: colors.textSecondary }]}>
                Only critical safety alerts will be delivered during quiet hours.
              </Text>
            </GlassCard>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
          <GlassCard style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                markAllAsRead();
              }}
            >
              <View style={styles.actionInfo}>
                <MaterialIcons name="done-all" size={20} color={Colors.success} />
                <Text style={[styles.actionText, { color: colors.text }]}>Mark All as Read</Text>
              </View>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.toggleDivider} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                clearAll();
              }}
            >
              <View style={styles.actionInfo}>
                <MaterialIcons name="delete-sweep" size={20} color={Colors.error} />
                <Text style={[styles.actionText, { color: colors.text }]}>Clear All Notifications</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

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
    paddingVertical: Spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.xl, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.lg, fontWeight: '700', marginBottom: Spacing.md },
  permissionCard: { alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.xl },
  permissionTitle: { fontSize: Typography.lg, fontWeight: '700', marginTop: Spacing.md },
  permissionText: { fontSize: Typography.base, textAlign: 'center', marginTop: Spacing.sm },
  permissionButton: { marginTop: Spacing.lg, width: '100%' },
  permissionButtonGradient: { padding: Spacing.md, borderRadius: BorderRadius.base, alignItems: 'center' },
  permissionButtonText: { color: '#FFF', fontSize: Typography.base, fontWeight: '600' },
  toggleCard: { padding: Spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toggleIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  toggleTextContainer: { marginLeft: Spacing.md, flex: 1 },
  toggleTitle: { fontSize: Typography.base, fontWeight: '600' },
  toggleDescription: { fontSize: Typography.xs, marginTop: 2 },
  toggleDivider: { height: 1, backgroundColor: 'rgba(100,100,100,0.1)', marginVertical: Spacing.xs },
  quietHoursCard: { marginTop: Spacing.sm, padding: Spacing.lg },
  quietHoursTitle: { fontSize: Typography.base, fontWeight: '600' },
  quietHoursText: { fontSize: Typography.sm, marginTop: Spacing.xs },
  actionsCard: { padding: Spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md },
  actionInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  actionText: { fontSize: Typography.base, fontWeight: '600' },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { color: '#FFF', fontSize: Typography.xs, fontWeight: '700' },
});
