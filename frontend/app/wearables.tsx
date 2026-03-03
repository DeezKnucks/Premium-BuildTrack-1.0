import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
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
import { useWearableIntegration, WearableDevice } from '../services/WearableIntegrationService';

export default function WearablesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<WearableDevice[]>([]);

  const {
    isAvailable,
    isConnecting,
    connectedDevices,
    latestHealthData,
    permissionsGranted,
    lastSyncTime,
    requestPermissions,
    scanForDevices,
    connectDevice,
    disconnectDevice,
    fetchHealthData,
  } = useWearableIntegration();

  const handleRequestPermissions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Health permissions granted!');
    } else {
      Alert.alert('Permission Required', 'Please grant health permissions in Settings to use wearable features.');
    }
  };

  const handleScan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScanning(true);
    const devices = await scanForDevices();
    setDiscoveredDevices(devices);
    setScanning(false);
  };

  const handleConnect = async (device: WearableDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await connectDevice(device);
    if (success) {
      Alert.alert('Connected', `${device.name} connected successfully!`);
      setDiscoveredDevices([]);
    } else {
      Alert.alert('Connection Failed', 'Could not connect to device. Please try again.');
    }
  };

  const handleDisconnect = (deviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => disconnectDevice(deviceId) },
      ]
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'apple_watch': return 'watch';
      case 'galaxy_watch': return 'watch';
      case 'fitbit': return 'watch';
      default: return 'bluetooth';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wearable Devices</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permissions Card */}
        {!permissionsGranted && (
          <GlassCard style={styles.permissionCard}>
            <MaterialIcons name="lock" size={32} color={Colors.warning} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>
              Health Permissions Required
            </Text>
            <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
              Grant access to health data to sync with your wearable devices.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermissions}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>Grant Permissions</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Connected Devices */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Devices</Text>
          
          {connectedDevices.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <MaterialIcons name="watch-off" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No devices connected
              </Text>
            </GlassCard>
          ) : (
            connectedDevices.map((device) => (
              <GlassCard key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <View style={[styles.deviceIcon, { backgroundColor: Colors.primary + '20' }]}>
                    <MaterialIcons name={getDeviceIcon(device.type)} size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.deviceDetails}>
                    <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
                    <View style={styles.deviceStatus}>
                      <View style={[styles.statusDot, { backgroundColor: device.connected ? Colors.success : Colors.error }]} />
                      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                        {device.connected ? 'Connected' : 'Disconnected'}
                      </Text>
                    </View>
                  </View>
                  {device.batteryLevel && (
                    <View style={styles.batteryInfo}>
                      <MaterialIcons 
                        name={device.batteryLevel > 20 ? 'battery-full' : 'battery-alert'}
                        size={20}
                        color={device.batteryLevel > 20 ? Colors.success : Colors.error}
                      />
                      <Text style={[styles.batteryText, { color: colors.text }]}>
                        {device.batteryLevel}%
                      </Text>
                    </View>
                  )}
                </View>
                {device.connected && (
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => handleDisconnect(device.id)}
                  >
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))
          )}
        </View>

        {/* Scan for Devices */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleScan} disabled={scanning || !permissionsGranted}>
            <GlassCard style={[styles.scanCard, !permissionsGranted && styles.disabledCard]}>
              {scanning || isConnecting ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MaterialIcons name="bluetooth-searching" size={28} color={Colors.primary} />
              )}
              <Text style={[styles.scanText, { color: colors.text }]}>
                {scanning ? 'Scanning...' : 'Scan for Devices'}
              </Text>
            </GlassCard>
          </TouchableOpacity>

          {/* Discovered Devices */}
          {discoveredDevices.map((device) => (
            <TouchableOpacity key={device.id} onPress={() => handleConnect(device)}>
              <GlassCard style={styles.discoveredCard}>
                <MaterialIcons name={getDeviceIcon(device.type)} size={24} color={colors.textSecondary} />
                <Text style={[styles.discoveredName, { color: colors.text }]}>{device.name}</Text>
                <MaterialIcons name="add-circle" size={24} color={Colors.primary} />
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health Data */}
        {latestHealthData && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Health Data</Text>
            <GlassCard style={styles.healthCard}>
              <View style={styles.healthGrid}>
                <View style={styles.healthItem}>
                  <MaterialIcons name="favorite" size={24} color="#EF4444" />
                  <Text style={[styles.healthValue, { color: colors.text }]}>
                    {latestHealthData.heartRate || '--'}
                  </Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>BPM</Text>
                </View>
                <View style={styles.healthItem}>
                  <MaterialIcons name="directions-walk" size={24} color={Colors.primary} />
                  <Text style={[styles.healthValue, { color: colors.text }]}>
                    {latestHealthData.steps.toLocaleString()}
                  </Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Steps</Text>
                </View>
                <View style={styles.healthItem}>
                  <MaterialIcons name="local-fire-department" size={24} color={Colors.warning} />
                  <Text style={[styles.healthValue, { color: colors.text }]}>
                    {latestHealthData.caloriesBurned}
                  </Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Cal</Text>
                </View>
                <View style={styles.healthItem}>
                  <MaterialIcons name="air" size={24} color={Colors.success} />
                  <Text style={[styles.healthValue, { color: colors.text }]}>
                    {latestHealthData.bloodOxygen || '--'}%
                  </Text>
                  <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>SpO2</Text>
                </View>
              </View>
              {lastSyncTime && (
                <Text style={[styles.syncTime, { color: colors.textSecondary }]}>
                  Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
                </Text>
              )}
            </GlassCard>
          </View>
        )}

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
  emptyCard: { alignItems: 'center', padding: Spacing.xl },
  emptyText: { fontSize: Typography.base, marginTop: Spacing.md },
  deviceCard: { marginBottom: Spacing.sm },
  deviceInfo: { flexDirection: 'row', alignItems: 'center' },
  deviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  deviceDetails: { flex: 1, marginLeft: Spacing.md },
  deviceName: { fontSize: Typography.base, fontWeight: '600' },
  deviceStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: Typography.sm },
  batteryInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  batteryText: { fontSize: Typography.sm, fontWeight: '600' },
  disconnectButton: { marginTop: Spacing.md, alignSelf: 'flex-end' },
  disconnectText: { color: Colors.error, fontSize: Typography.sm, fontWeight: '600' },
  scanCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  disabledCard: { opacity: 0.5 },
  scanText: { fontSize: Typography.base, fontWeight: '600' },
  discoveredCard: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md },
  discoveredName: { flex: 1, fontSize: Typography.base },
  healthCard: { padding: Spacing.lg },
  healthGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  healthItem: { alignItems: 'center' },
  healthValue: { fontSize: Typography.xl, fontWeight: '800', marginTop: Spacing.xs },
  healthLabel: { fontSize: Typography.xs, marginTop: 2 },
  syncTime: { fontSize: Typography.xs, textAlign: 'center', marginTop: Spacing.md },
});
