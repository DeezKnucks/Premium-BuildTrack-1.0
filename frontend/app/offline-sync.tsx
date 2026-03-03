import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { SimpleProgressBar } from '../components/Charts';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useOfflineSync } from '../services/OfflineSyncService';

export default function OfflineSyncScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncAt,
    syncErrors,
    syncAll,
    refreshFromServer,
  } = useOfflineSync();

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await syncAll();
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refreshFromServer();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Offline Sync</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Status Card */}
        <GlassCard style={styles.statusCard}>
          <LinearGradient
            colors={isOnline ? [Colors.success, '#059669'] : ['#6B7280', '#4B5563']}
            style={styles.statusGradient}
          >
            <MaterialIcons
              name={isOnline ? 'cloud-done' : 'cloud-off'}
              size={48}
              color="#FFF"
            />
            <Text style={styles.statusTitle}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isOnline 
                ? 'Data will sync automatically' 
                : 'Changes will sync when online'}
            </Text>
          </LinearGradient>
        </GlassCard>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync Status</Text>
          
          <GlassCard style={styles.syncCard}>
            <View style={styles.syncRow}>
              <View style={styles.syncInfo}>
                <MaterialIcons name="pending" size={24} color={Colors.warning} />
                <View style={styles.syncTextContainer}>
                  <Text style={[styles.syncLabel, { color: colors.text }]}>Pending Items</Text>
                  <Text style={[styles.syncValue, { color: colors.textSecondary }]}>
                    {pendingCount} items waiting to sync
                  </Text>
                </View>
              </View>
              {pendingCount > 0 && (
                <View style={[styles.badge, { backgroundColor: Colors.warning }]}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.syncRow}>
              <View style={styles.syncInfo}>
                <MaterialIcons name="update" size={24} color={Colors.primary} />
                <View style={styles.syncTextContainer}>
                  <Text style={[styles.syncLabel, { color: colors.text }]}>Last Sync</Text>
                  <Text style={[styles.syncValue, { color: colors.textSecondary }]}>
                    {lastSyncAt 
                      ? new Date(lastSyncAt).toLocaleString() 
                      : 'Never synced'}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Sync Button */}
          <TouchableOpacity
            onPress={handleSync}
            disabled={isSyncing || !isOnline || pendingCount === 0}
          >
            <GlassCard style={[
              styles.syncButton,
              (!isOnline || pendingCount === 0) && styles.syncButtonDisabled
            ]}>
              {isSyncing ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <MaterialIcons name="sync" size={24} color={Colors.primary} />
              )}
              <Text style={[styles.syncButtonText, { color: colors.text }]}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Sync Errors */}
        {syncErrors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync Errors</Text>
            {syncErrors.map((error, index) => (
              <GlassCard key={index} style={styles.errorCard}>
                <MaterialIcons name="error" size={20} color={Colors.error} />
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Storage Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Offline Storage</Text>
          
          <GlassCard style={styles.storageCard}>
            <View style={styles.storageItem}>
              <View style={styles.storageInfo}>
                <MaterialIcons name="folder" size={20} color={Colors.primary} />
                <Text style={[styles.storageLabel, { color: colors.text }]}>Projects</Text>
              </View>
              <Text style={[styles.storageValue, { color: colors.textSecondary }]}>Cached</Text>
            </View>
            <View style={styles.storageItem}>
              <View style={styles.storageInfo}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={[styles.storageLabel, { color: colors.text }]}>Tasks</Text>
              </View>
              <Text style={[styles.storageValue, { color: colors.textSecondary }]}>Cached</Text>
            </View>
            <View style={styles.storageItem}>
              <View style={styles.storageInfo}>
                <MaterialIcons name="person" size={20} color={Colors.secondary} />
                <Text style={[styles.storageLabel, { color: colors.text }]}>User Profile</Text>
              </View>
              <Text style={[styles.storageValue, { color: colors.textSecondary }]}>Cached</Text>
            </View>
          </GlassCard>
        </View>

        {/* Info Card */}
        <GlassCard style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color={Colors.secondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            BuildTrack automatically saves your work offline. When you regain connectivity, all changes will sync to the cloud. Safety alerts are queued and sent immediately when online.
          </Text>
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
    paddingVertical: Spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.xl, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  statusCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xl },
  statusGradient: { padding: Spacing.xl, alignItems: 'center' },
  statusTitle: { fontSize: Typography['2xl'], fontWeight: '800', color: '#FFF', marginTop: Spacing.md },
  statusSubtitle: { fontSize: Typography.base, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.xs },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.lg, fontWeight: '700', marginBottom: Spacing.md },
  syncCard: { padding: Spacing.lg },
  syncRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  syncInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  syncTextContainer: {},
  syncLabel: { fontSize: Typography.base, fontWeight: '600' },
  syncValue: { fontSize: Typography.sm, marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { color: '#FFF', fontSize: Typography.xs, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(100,100,100,0.2)', marginVertical: Spacing.md },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  syncButtonDisabled: { opacity: 0.5 },
  syncButtonText: { fontSize: Typography.base, fontWeight: '600' },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs, padding: Spacing.md },
  errorText: { flex: 1, fontSize: Typography.sm },
  storageCard: { padding: Spacing.lg },
  storageItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  storageInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  storageLabel: { fontSize: Typography.base },
  storageValue: { fontSize: Typography.sm },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.lg },
  infoText: { flex: 1, fontSize: Typography.sm, lineHeight: 20 },
});
