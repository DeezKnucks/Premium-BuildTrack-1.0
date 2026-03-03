import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Wearable device types
export type WearableType = 'apple_watch' | 'galaxy_watch' | 'fitbit' | 'garmin' | 'other';

export interface WearableDevice {
  id: string;
  name: string;
  type: WearableType;
  connected: boolean;
  lastSync: number | null;
  batteryLevel: number | null;
  firmwareVersion: string | null;
}

export interface HealthData {
  heartRate: number | null;
  heartRateVariability: number | null;
  steps: number;
  distance: number;
  caloriesBurned: number;
  activeMinutes: number;
  sleepHours: number | null;
  bloodOxygen: number | null;
  bodyTemperature: number | null;
  stressLevel: number | null;
  timestamp: number;
}

export interface WorkoutData {
  id: string;
  type: 'walking' | 'running' | 'climbing' | 'lifting' | 'other';
  startTime: number;
  endTime: number;
  duration: number; // minutes
  calories: number;
  averageHeartRate: number | null;
  maxHeartRate: number | null;
  distance: number | null;
}

export interface WearableServiceState {
  isAvailable: boolean;
  isConnecting: boolean;
  connectedDevices: WearableDevice[];
  latestHealthData: HealthData | null;
  recentWorkouts: WorkoutData[];
  permissionsGranted: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

// Safety thresholds for wearable data
const SAFETY_THRESHOLDS = {
  heartRateHigh: 180,
  heartRateLow: 40,
  bloodOxygenLow: 90,
  bodyTempHigh: 39.5, // Celsius
  bodyTempLow: 35.0,
  stressLevelHigh: 80,
};

class WearableIntegrationService {
  private listeners: ((state: WearableServiceState) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private state: WearableServiceState = {
    isAvailable: false,
    isConnecting: false,
    connectedDevices: [],
    latestHealthData: null,
    recentWorkouts: [],
    permissionsGranted: false,
    lastSyncTime: null,
    error: null,
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check platform availability
    this.state.isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
    
    // Load saved devices
    await this.loadSavedDevices();
    
    this.notifyListeners();
  }

  subscribe(listener: (state: WearableServiceState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  private async loadSavedDevices() {
    try {
      const saved = await AsyncStorage.getItem('wearable_devices');
      if (saved) {
        this.state.connectedDevices = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved devices:', error);
    }
  }

  private async saveDevices() {
    try {
      await AsyncStorage.setItem('wearable_devices', JSON.stringify(this.state.connectedDevices));
    } catch (error) {
      console.error('Failed to save devices:', error);
    }
  }

  // Request health data permissions
  async requestPermissions(): Promise<boolean> {
    try {
      // On iOS, this would use HealthKit
      // On Android, this would use Health Connect or Samsung Health SDK
      
      if (Platform.OS === 'ios') {
        // HealthKit permissions would be requested here
        // For now, simulate permission grant
        console.log('Requesting HealthKit permissions...');
        this.state.permissionsGranted = true;
      } else if (Platform.OS === 'android') {
        // Health Connect permissions would be requested here
        console.log('Requesting Health Connect permissions...');
        this.state.permissionsGranted = true;
      }

      this.notifyListeners();
      return this.state.permissionsGranted;
    } catch (error) {
      console.error('Permission request failed:', error);
      this.state.error = 'Failed to request health permissions';
      this.notifyListeners();
      return false;
    }
  }

  // Scan for available wearable devices
  async scanForDevices(): Promise<WearableDevice[]> {
    this.state.isConnecting = true;
    this.notifyListeners();

    try {
      // Simulate device scanning
      // In production, this would use Bluetooth scanning or platform health APIs
      
      const discoveredDevices: WearableDevice[] = [];

      // Check for Apple Watch on iOS
      if (Platform.OS === 'ios') {
        // HealthKit would indicate if Apple Watch is paired
        discoveredDevices.push({
          id: 'apple_watch_1',
          name: 'Apple Watch',
          type: 'apple_watch',
          connected: false,
          lastSync: null,
          batteryLevel: null,
          firmwareVersion: null,
        });
      }

      // Check for Galaxy Watch on Android
      if (Platform.OS === 'android') {
        discoveredDevices.push({
          id: 'galaxy_watch_1',
          name: 'Galaxy Watch',
          type: 'galaxy_watch',
          connected: false,
          lastSync: null,
          batteryLevel: null,
          firmwareVersion: null,
        });
      }

      return discoveredDevices;
    } catch (error) {
      console.error('Device scan failed:', error);
      this.state.error = 'Failed to scan for devices';
      return [];
    } finally {
      this.state.isConnecting = false;
      this.notifyListeners();
    }
  }

  // Connect to a wearable device
  async connectDevice(device: WearableDevice): Promise<boolean> {
    this.state.isConnecting = true;
    this.notifyListeners();

    try {
      // Simulate connection
      // In production, this would establish Bluetooth connection or API link
      
      const connectedDevice: WearableDevice = {
        ...device,
        connected: true,
        lastSync: Date.now(),
        batteryLevel: 85, // Simulated
        firmwareVersion: '2.0.1', // Simulated
      };

      // Add or update in connected devices list
      const existingIndex = this.state.connectedDevices.findIndex(d => d.id === device.id);
      if (existingIndex >= 0) {
        this.state.connectedDevices[existingIndex] = connectedDevice;
      } else {
        this.state.connectedDevices.push(connectedDevice);
      }

      await this.saveDevices();

      // Start automatic sync
      this.startAutoSync();

      // Initial data fetch
      await this.fetchHealthData();

      return true;
    } catch (error) {
      console.error('Device connection failed:', error);
      this.state.error = 'Failed to connect to device';
      return false;
    } finally {
      this.state.isConnecting = false;
      this.notifyListeners();
    }
  }

  // Disconnect a wearable device
  async disconnectDevice(deviceId: string): Promise<void> {
    const index = this.state.connectedDevices.findIndex(d => d.id === deviceId);
    if (index >= 0) {
      this.state.connectedDevices[index].connected = false;
      await this.saveDevices();
      this.notifyListeners();
    }
  }

  // Fetch health data from connected devices
  async fetchHealthData(): Promise<HealthData | null> {
    if (this.state.connectedDevices.filter(d => d.connected).length === 0) {
      return null;
    }

    try {
      // In production, this would fetch from HealthKit/Health Connect
      // Simulate health data
      const healthData: HealthData = {
        heartRate: 72 + Math.floor(Math.random() * 20),
        heartRateVariability: 45 + Math.floor(Math.random() * 30),
        steps: 5000 + Math.floor(Math.random() * 3000),
        distance: 3.5 + Math.random() * 2,
        caloriesBurned: 250 + Math.floor(Math.random() * 150),
        activeMinutes: 45 + Math.floor(Math.random() * 30),
        sleepHours: 7 + Math.random() * 2,
        bloodOxygen: 96 + Math.floor(Math.random() * 4),
        bodyTemperature: 36.5 + Math.random() * 0.5,
        stressLevel: 30 + Math.floor(Math.random() * 40),
        timestamp: Date.now(),
      };

      this.state.latestHealthData = healthData;
      this.state.lastSyncTime = Date.now();

      // Check for safety alerts
      this.checkHealthSafetyAlerts(healthData);

      this.notifyListeners();
      return healthData;
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      return null;
    }
  }

  // Check health data against safety thresholds
  private checkHealthSafetyAlerts(data: HealthData) {
    const alerts: string[] = [];

    if (data.heartRate && data.heartRate > SAFETY_THRESHOLDS.heartRateHigh) {
      alerts.push(`High heart rate detected: ${data.heartRate} BPM`);
    }
    if (data.heartRate && data.heartRate < SAFETY_THRESHOLDS.heartRateLow) {
      alerts.push(`Low heart rate detected: ${data.heartRate} BPM`);
    }
    if (data.bloodOxygen && data.bloodOxygen < SAFETY_THRESHOLDS.bloodOxygenLow) {
      alerts.push(`Low blood oxygen: ${data.bloodOxygen}%`);
    }
    if (data.bodyTemperature && data.bodyTemperature > SAFETY_THRESHOLDS.bodyTempHigh) {
      alerts.push(`High body temperature: ${data.bodyTemperature.toFixed(1)}°C`);
    }
    if (data.stressLevel && data.stressLevel > SAFETY_THRESHOLDS.stressLevelHigh) {
      alerts.push(`High stress level: ${data.stressLevel}`);
    }

    // Emit alerts (in production, would trigger notifications)
    if (alerts.length > 0) {
      console.warn('Health safety alerts:', alerts);
      // Could integrate with safety monitoring service here
    }
  }

  // Start automatic data sync
  startAutoSync(intervalMs: number = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.fetchHealthData();
    }, intervalMs);
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Get recent workouts
  async fetchWorkouts(days: number = 7): Promise<WorkoutData[]> {
    try {
      // In production, fetch from HealthKit/Health Connect
      // Simulate workout data
      const workouts: WorkoutData[] = [
        {
          id: 'workout_1',
          type: 'walking',
          startTime: Date.now() - 3600000,
          endTime: Date.now() - 1800000,
          duration: 30,
          calories: 150,
          averageHeartRate: 95,
          maxHeartRate: 120,
          distance: 2.5,
        },
        {
          id: 'workout_2',
          type: 'climbing',
          startTime: Date.now() - 86400000,
          endTime: Date.now() - 84600000,
          duration: 30,
          calories: 200,
          averageHeartRate: 110,
          maxHeartRate: 145,
          distance: null,
        },
      ];

      this.state.recentWorkouts = workouts;
      this.notifyListeners();
      return workouts;
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      return [];
    }
  }

  // Get health data summary for AI analysis
  getHealthSummaryForAI(): object {
    return {
      connectedDevices: this.state.connectedDevices.map(d => ({
        type: d.type,
        connected: d.connected,
      })),
      latestHealth: this.state.latestHealthData,
      recentWorkouts: this.state.recentWorkouts.slice(0, 5),
      lastSync: this.state.lastSyncTime,
    };
  }

  getState(): WearableServiceState {
    return { ...this.state };
  }

  destroy() {
    this.stopAutoSync();
  }
}

// Singleton instance
export const wearableService = new WearableIntegrationService();

// React Hook
export function useWearableIntegration() {
  const [state, setState] = useState<WearableServiceState>(wearableService.getState());

  useEffect(() => {
    const unsubscribe = wearableService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    requestPermissions: () => wearableService.requestPermissions(),
    scanForDevices: () => wearableService.scanForDevices(),
    connectDevice: (device: WearableDevice) => wearableService.connectDevice(device),
    disconnectDevice: (id: string) => wearableService.disconnectDevice(id),
    fetchHealthData: () => wearableService.fetchHealthData(),
    fetchWorkouts: (days?: number) => wearableService.fetchWorkouts(days),
    startAutoSync: (interval?: number) => wearableService.startAutoSync(interval),
    stopAutoSync: () => wearableService.stopAutoSync(),
    getHealthSummaryForAI: () => wearableService.getHealthSummaryForAI(),
  };
}

export default wearableService;
