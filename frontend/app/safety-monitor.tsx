import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
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
import { useSensorData, SafetyAlert } from '../services/SensorService';

const { width } = Dimensions.get('window');

export default function SafetyMonitorScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    isMonitoring,
    accelerometer,
    gyroscope,
    location,
    barometer,
    activityMetrics,
    environmental,
    alerts,
    deviceInfo,
    batteryLevel,
    startMonitoring,
    stopMonitoring,
    acknowledgeAlert,
    getSensorDataForAI,
  } = useSensorData();

  const handleToggleMonitoring = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isMonitoring) {
      Alert.alert(
        'Stop Safety Monitoring?',
        'This will disable fall detection and safety alerts. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Stop',
            style: 'destructive',
            onPress: () => stopMonitoring(),
          },
        ]
      );
    } else {
      await startMonitoring();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    acknowledgeAlert(alertId);
  };

  const handleEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Emergency Alert',
      'This will notify your emergency contacts and project managers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            // In production, this would send an emergency alert
            Alert.alert('Alert Sent', 'Emergency contacts have been notified.');
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#EAB308';
      case 'low': return '#22C55E';
      default: return colors.textSecondary;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fall_detected': return 'warning';
      case 'impact_detected': return 'flash-on';
      case 'rapid_descent': return 'trending-down';
      case 'prolonged_stillness': return 'accessibility';
      case 'geofence_breach': return 'wrong-location';
      case 'environmental_hazard': return 'thermostat';
      default: return 'info';
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Safety Monitor</Text>
        <TouchableOpacity onPress={handleEmergency} style={styles.emergencyButton}>
          <MaterialIcons name="sos" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Monitoring Status Card */}
        <GlassCard style={styles.statusCard}>
          <LinearGradient
            colors={isMonitoring ? [Colors.success, '#059669'] : ['#6B7280', '#4B5563']}
            style={styles.statusGradient}
          >
            <View style={styles.statusContent}>
              <View style={styles.statusInfo}>
                <MaterialIcons
                  name={isMonitoring ? 'shield' : 'shield-outline' as any}
                  size={48}
                  color="#FFF"
                />
                <View style={styles.statusText}>
                  <Text style={styles.statusTitle}>
                    {isMonitoring ? 'Protection Active' : 'Protection Off'}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {isMonitoring 
                      ? 'Monitoring falls, impacts & motion' 
                      : 'Enable to start safety monitoring'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isMonitoring}
                onValueChange={handleToggleMonitoring}
                trackColor={{ false: '#767577', true: '#81C784' }}
                thumbColor={isMonitoring ? '#4CAF50' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Active Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Alerts ({unacknowledgedAlerts.length})
            </Text>
            {unacknowledgedAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                onPress={() => handleAcknowledgeAlert(alert.id)}
              >
                <GlassCard style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
                  <View style={styles.alertContent}>
                    <View style={[styles.alertIconContainer, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                      <MaterialIcons
                        name={getAlertIcon(alert.type) as any}
                        size={24}
                        color={getSeverityColor(alert.severity)}
                      />
                    </View>
                    <View style={styles.alertInfo}>
                      <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.message}</Text>
                      <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <MaterialIcons name="check-circle-outline" size={24} color={colors.textSecondary} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sensor Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Sensor Data</Text>
          
          <View style={styles.sensorGrid}>
            {/* Accelerometer */}
            <GlassCard style={styles.sensorCard}>
              <MaterialIcons name="speed" size={28} color={Colors.primary} />
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>Acceleration</Text>
              {accelerometer ? (
                <View style={styles.sensorValues}>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    X: {accelerometer.x.toFixed(2)}
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    Y: {accelerometer.y.toFixed(2)}
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    Z: {accelerometer.z.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.sensorInactive, { color: colors.textSecondary }]}>
                  {isMonitoring ? 'Initializing...' : 'Inactive'}
                </Text>
              )}
            </GlassCard>

            {/* Gyroscope */}
            <GlassCard style={styles.sensorCard}>
              <MaterialIcons name="360" size={28} color={Colors.secondary} />
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>Rotation</Text>
              {gyroscope ? (
                <View style={styles.sensorValues}>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    α: {gyroscope.x.toFixed(2)}
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    β: {gyroscope.y.toFixed(2)}
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    γ: {gyroscope.z.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.sensorInactive, { color: colors.textSecondary }]}>
                  {isMonitoring ? 'Initializing...' : 'Inactive'}
                </Text>
              )}
            </GlassCard>

            {/* Location */}
            <GlassCard style={styles.sensorCard}>
              <MaterialIcons name="location-on" size={28} color={Colors.success} />
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>GPS</Text>
              {location ? (
                <View style={styles.sensorValues}>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    {location.latitude.toFixed(5)}°
                  </Text>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    {location.longitude.toFixed(5)}°
                  </Text>
                  {location.altitude && (
                    <Text style={[styles.sensorValue, { color: colors.text }]}>
                      Alt: {location.altitude.toFixed(1)}m
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={[styles.sensorInactive, { color: colors.textSecondary }]}>
                  {isMonitoring ? 'Acquiring...' : 'Inactive'}
                </Text>
              )}
            </GlassCard>

            {/* Barometer */}
            <GlassCard style={styles.sensorCard}>
              <MaterialIcons name="compress" size={28} color={Colors.warning} />
              <Text style={[styles.sensorLabel, { color: colors.textSecondary }]}>Pressure</Text>
              {barometer ? (
                <View style={styles.sensorValues}>
                  <Text style={[styles.sensorValue, { color: colors.text }]}>
                    {barometer.pressure.toFixed(1)} hPa
                  </Text>
                  {environmental?.altitude && (
                    <Text style={[styles.sensorValue, { color: colors.text }]}>
                      ~{environmental.altitude.toFixed(0)}m ASL
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={[styles.sensorInactive, { color: colors.textSecondary }]}>
                  {isMonitoring ? 'Initializing...' : 'Inactive'}
                </Text>
              )}
            </GlassCard>
          </View>
        </View>

        {/* Activity Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Today</Text>
          
          <GlassCard style={styles.activityCard}>
            <View style={styles.activityGrid}>
              <View style={styles.activityItem}>
                <MaterialIcons name="directions-walk" size={32} color={Colors.primary} />
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {activityMetrics.stepsToday.toLocaleString()}
                </Text>
                <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>Steps</Text>
              </View>
              
              <View style={styles.activityItem}>
                <MaterialIcons name="straighten" size={32} color={Colors.success} />
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {(activityMetrics.distanceTraveled / 1000).toFixed(2)}
                </Text>
                <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>km Traveled</Text>
              </View>
              
              <View style={styles.activityItem}>
                <MaterialIcons name="stairs" size={32} color={Colors.secondary} />
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {activityMetrics.floorsClimbed}
                </Text>
                <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>Floors</Text>
              </View>
              
              <View style={styles.activityItem}>
                <MaterialIcons name="local-fire-department" size={32} color={Colors.warning} />
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {Math.round(activityMetrics.caloriesBurned)}
                </Text>
                <Text style={[styles.activityLabel, { color: colors.textSecondary }]}>Calories</Text>
              </View>
            </View>

            <View style={styles.activityStatus}>
              <Text style={[styles.activityStatusLabel, { color: colors.textSecondary }]}>
                Current Activity
              </Text>
              <View style={styles.activityStatusBadge}>
                <MaterialIcons
                  name={
                    activityMetrics.lastActivityType === 'walking' ? 'directions-walk' :
                    activityMetrics.lastActivityType === 'climbing' ? 'stairs' :
                    activityMetrics.lastActivityType === 'vehicle' ? 'directions-car' :
                    'accessibility'
                  }
                  size={20}
                  color={Colors.primary}
                />
                <Text style={[styles.activityStatusText, { color: colors.text }]}>
                  {activityMetrics.lastActivityType.charAt(0).toUpperCase() + 
                   activityMetrics.lastActivityType.slice(1)}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Device Status</Text>
          
          <GlassCard style={styles.deviceCard}>
            <View style={styles.deviceInfo}>
              <MaterialIcons name="phone-android" size={40} color={Colors.primary} />
              <View style={styles.deviceDetails}>
                <Text style={[styles.deviceName, { color: colors.text }]}>
                  {deviceInfo?.brand} {deviceInfo?.modelName}
                </Text>
                <Text style={[styles.deviceOS, { color: colors.textSecondary }]}>
                  {deviceInfo?.osName} {deviceInfo?.osVersion}
                </Text>
              </View>
            </View>
            
            <View style={styles.batteryContainer}>
              <View style={styles.batteryHeader}>
                <MaterialIcons
                  name={batteryLevel > 20 ? 'battery-full' : 'battery-alert'}
                  size={20}
                  color={batteryLevel > 20 ? Colors.success : '#EF4444'}
                />
                <Text style={[styles.batteryText, { color: colors.text }]}>
                  {batteryLevel}%
                </Text>
              </View>
              <SimpleProgressBar
                progress={batteryLevel}
                height={8}
                color={batteryLevel > 20 ? Colors.success : '#EF4444'}
              />
            </View>
          </GlassCard>
        </View>

        {/* Alert History */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Alert History ({alerts.length})
            </Text>
            {alerts.slice(0, 5).map((alert) => (
              <GlassCard key={alert.id} style={styles.historyCard}>
                <View style={styles.historyContent}>
                  <View style={[styles.historyDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyMessage, { color: colors.text }]} numberOfLines={1}>
                      {alert.message}
                    </Text>
                    <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  {alert.acknowledged && (
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                  )}
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
  },
  emergencyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  statusCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  statusGradient: {
    padding: Spacing.lg,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: '#FFF',
  },
  statusSubtitle: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  alertCard: {
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.base,
    fontWeight: '600',
  },
  alertTime: {
    fontSize: Typography.sm,
    marginTop: 2,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sensorCard: {
    width: (width - 48 - 8) / 2,
    padding: Spacing.md,
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sensorValues: {
    alignItems: 'center',
  },
  sensorValue: {
    fontSize: Typography.xs,
    fontFamily: 'monospace',
  },
  sensorInactive: {
    fontSize: Typography.sm,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  activityCard: {
    padding: Spacing.lg,
  },
  activityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityValue: {
    fontSize: Typography.xl,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  activityLabel: {
    fontSize: Typography.xs,
    marginTop: 2,
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(100,100,100,0.2)',
    paddingTop: Spacing.md,
  },
  activityStatusLabel: {
    fontSize: Typography.sm,
  },
  activityStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
  },
  activityStatusText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  deviceCard: {
    padding: Spacing.lg,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.base,
    fontWeight: '600',
  },
  deviceOS: {
    fontSize: Typography.sm,
    marginTop: 2,
  },
  batteryContainer: {
    gap: Spacing.sm,
  },
  batteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  batteryText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  historyCard: {
    marginBottom: Spacing.xs,
    padding: Spacing.md,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyInfo: {
    flex: 1,
  },
  historyMessage: {
    fontSize: Typography.sm,
  },
  historyTime: {
    fontSize: Typography.xs,
    marginTop: 2,
  },
});
