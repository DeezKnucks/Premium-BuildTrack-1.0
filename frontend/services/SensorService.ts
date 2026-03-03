import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  Barometer,
  Pedometer,
  DeviceMotion,
} from 'expo-sensors';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for sensor data
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface BarometerData {
  pressure: number; // hPa
  relativeAltitude?: number;
  timestamp: number;
}

export interface DeviceMotionData {
  acceleration: { x: number; y: number; z: number } | null;
  accelerationIncludingGravity: { x: number; y: number; z: number } | null;
  rotation: { alpha: number; beta: number; gamma: number } | null;
  rotationRate: { alpha: number; beta: number; gamma: number } | null;
  orientation: number;
  timestamp: number;
}

export interface SafetyAlert {
  id: string;
  type: 'fall_detected' | 'impact_detected' | 'rapid_descent' | 'prolonged_stillness' | 'geofence_breach' | 'environmental_hazard';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: number;
  acknowledged: boolean;
  location?: LocationData;
}

export interface WorkerActivityMetrics {
  stepsToday: number;
  activeMinutes: number;
  restMinutes: number;
  distanceTraveled: number;
  floorsClimbed: number;
  averageHeartRate?: number; // If wearable connected
  caloriesBurned: number;
  lastActivityType: 'walking' | 'climbing' | 'stationary' | 'vehicle' | 'unknown';
}

export interface EnvironmentalData {
  temperature?: number;
  humidity?: number;
  pressure: number;
  altitude: number;
  noiseLevel?: number;
  lightLevel?: number;
}

export interface SensorServiceState {
  isMonitoring: boolean;
  lastUpdate: number;
  accelerometer: AccelerometerData | null;
  gyroscope: GyroscopeData | null;
  location: LocationData | null;
  barometer: BarometerData | null;
  deviceMotion: DeviceMotionData | null;
  activityMetrics: WorkerActivityMetrics;
  environmental: EnvironmentalData | null;
  alerts: SafetyAlert[];
  deviceInfo: DeviceInfo | null;
  batteryLevel: number;
}

export interface DeviceInfo {
  brand: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceType: string;
  isDevice: boolean;
}

// Constants for safety detection
const FALL_DETECTION_THRESHOLD = 25; // m/s² (free fall + impact)
const IMPACT_THRESHOLD = 35; // m/s² (severe impact)
const RAPID_DESCENT_RATE = 3; // meters per second
const STILLNESS_THRESHOLD = 0.5; // m/s² variance
const STILLNESS_DURATION = 300000; // 5 minutes in milliseconds
const GEOFENCE_RADIUS = 100; // meters

// Sensor Service Class
class SensorService {
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private magnetometerSubscription: any = null;
  private barometerSubscription: any = null;
  private deviceMotionSubscription: any = null;
  private locationSubscription: any = null;
  private pedometerSubscription: any = null;

  private accelerometerHistory: AccelerometerData[] = [];
  private locationHistory: LocationData[] = [];
  private lastMovementTime: number = Date.now();
  private geofences: { latitude: number; longitude: number; radius: number; name: string }[] = [];
  
  private listeners: ((state: SensorServiceState) => void)[] = [];
  
  private state: SensorServiceState = {
    isMonitoring: false,
    lastUpdate: Date.now(),
    accelerometer: null,
    gyroscope: null,
    location: null,
    barometer: null,
    deviceMotion: null,
    activityMetrics: {
      stepsToday: 0,
      activeMinutes: 0,
      restMinutes: 0,
      distanceTraveled: 0,
      floorsClimbed: 0,
      caloriesBurned: 0,
      lastActivityType: 'unknown',
    },
    environmental: null,
    alerts: [],
    deviceInfo: null,
    batteryLevel: 100,
  };

  constructor() {
    this.initializeDeviceInfo();
  }

  private async initializeDeviceInfo() {
    this.state.deviceInfo = {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      deviceType: Device.deviceType?.toString() || 'unknown',
      isDevice: Device.isDevice,
    };

    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.state.batteryLevel = Math.round(batteryLevel * 100);
    } catch (e) {
      console.log('Battery API not available');
    }
  }

  subscribe(listener: (state: SensorServiceState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.state.lastUpdate = Date.now();
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  async startMonitoring() {
    if (this.state.isMonitoring) return;

    console.log('Starting sensor monitoring...');
    this.state.isMonitoring = true;

    // Request permissions
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      console.warn('Location permission not granted');
    }

    // Set update intervals for sensors
    Accelerometer.setUpdateInterval(100); // 10Hz
    Gyroscope.setUpdateInterval(100);
    DeviceMotion.setUpdateInterval(100);

    // Start accelerometer monitoring
    if (await Accelerometer.isAvailableAsync()) {
      this.accelerometerSubscription = Accelerometer.addListener(data => {
        this.handleAccelerometerData(data);
      });
    }

    // Start gyroscope monitoring
    if (await Gyroscope.isAvailableAsync()) {
      this.gyroscopeSubscription = Gyroscope.addListener(data => {
        this.state.gyroscope = { ...data, timestamp: Date.now() };
      });
    }

    // Start barometer monitoring (altitude/pressure)
    if (await Barometer.isAvailableAsync()) {
      this.barometerSubscription = Barometer.addListener(data => {
        this.handleBarometerData(data);
      });
    }

    // Start device motion monitoring
    if (await DeviceMotion.isAvailableAsync()) {
      this.deviceMotionSubscription = DeviceMotion.addListener(data => {
        this.handleDeviceMotionData(data);
      });
    }

    // Start location monitoring
    if (locationStatus === 'granted') {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        location => {
          this.handleLocationData(location);
        }
      );
    }

    // Start pedometer monitoring
    if (await Pedometer.isAvailableAsync()) {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      
      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        this.state.activityMetrics.stepsToday = result.steps;
      } catch (e) {
        console.log('Pedometer data not available');
      }

      this.pedometerSubscription = Pedometer.watchStepCount(result => {
        this.state.activityMetrics.stepsToday += result.steps;
        this.updateActivityMetrics();
      });
    }

    // Battery monitoring
    Battery.addBatteryLevelListener(({ batteryLevel }) => {
      this.state.batteryLevel = Math.round(batteryLevel * 100);
      this.notifyListeners();
    });

    this.notifyListeners();
    console.log('Sensor monitoring started');
  }

  async stopMonitoring() {
    console.log('Stopping sensor monitoring...');
    this.state.isMonitoring = false;

    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }
    if (this.barometerSubscription) {
      this.barometerSubscription.remove();
      this.barometerSubscription = null;
    }
    if (this.deviceMotionSubscription) {
      this.deviceMotionSubscription.remove();
      this.deviceMotionSubscription = null;
    }
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    this.notifyListeners();
    console.log('Sensor monitoring stopped');
  }

  private handleAccelerometerData(data: { x: number; y: number; z: number }) {
    const timestamp = Date.now();
    const accelerometerData: AccelerometerData = { ...data, timestamp };
    
    this.state.accelerometer = accelerometerData;
    
    // Keep history for analysis (last 50 samples = 5 seconds at 10Hz)
    this.accelerometerHistory.push(accelerometerData);
    if (this.accelerometerHistory.length > 50) {
      this.accelerometerHistory.shift();
    }

    // Calculate total acceleration magnitude
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2) * 9.81; // Convert to m/s²
    
    // Detect falls and impacts
    this.detectFallOrImpact(magnitude, accelerometerData);
    
    // Detect prolonged stillness
    this.detectStillness(magnitude);
    
    // Update activity type based on motion patterns
    this.classifyActivity(magnitude);
  }

  private handleBarometerData(data: { pressure: number; relativeAltitude?: number }) {
    const timestamp = Date.now();
    const barometerData: BarometerData = { ...data, timestamp };
    this.state.barometer = barometerData;

    // Calculate altitude from pressure (approximate)
    // Standard atmosphere: altitude = 44330 * (1 - (P/P0)^0.1903)
    const P0 = 1013.25; // Sea level standard pressure in hPa
    const altitude = 44330 * (1 - Math.pow(data.pressure / P0, 0.1903));

    this.state.environmental = {
      ...this.state.environmental,
      pressure: data.pressure,
      altitude: altitude,
    };

    // Detect rapid descent (potential fall from height)
    this.detectRapidDescent(altitude);
  }

  private handleDeviceMotionData(data: any) {
    const timestamp = Date.now();
    this.state.deviceMotion = {
      acceleration: data.acceleration,
      accelerationIncludingGravity: data.accelerationIncludingGravity,
      rotation: data.rotation,
      rotationRate: data.rotationRate,
      orientation: data.orientation || 0,
      timestamp,
    };
  }

  private handleLocationData(location: Location.LocationObject) {
    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      timestamp: location.timestamp,
    };

    this.state.location = locationData;
    
    // Keep location history for distance calculation
    this.locationHistory.push(locationData);
    if (this.locationHistory.length > 100) {
      this.locationHistory.shift();
    }

    // Update distance traveled
    this.updateDistanceTraveled();
    
    // Check geofences
    this.checkGeofences(locationData);

    this.notifyListeners();
  }

  private detectFallOrImpact(magnitude: number, data: AccelerometerData) {
    // Fall detection: Look for pattern of free fall (~0g) followed by impact (high g)
    if (this.accelerometerHistory.length >= 20) {
      const recentSamples = this.accelerometerHistory.slice(-20);
      
      // Check for free fall phase (very low acceleration)
      const hasFreeFall = recentSamples.some(sample => {
        const mag = Math.sqrt(sample.x ** 2 + sample.y ** 2 + sample.z ** 2) * 9.81;
        return mag < 3; // Less than ~0.3g
      });

      // Check for impact
      if (hasFreeFall && magnitude > FALL_DETECTION_THRESHOLD) {
        this.addAlert({
          type: 'fall_detected',
          severity: 'critical',
          message: 'Potential fall detected! Are you okay?',
          data: { magnitude, pattern: 'freefall_then_impact' },
        });
      }
    }

    // Direct impact detection (without free fall - could be struck by object)
    if (magnitude > IMPACT_THRESHOLD) {
      this.addAlert({
        type: 'impact_detected',
        severity: 'high',
        message: 'High impact detected. Please confirm you are safe.',
        data: { magnitude },
      });
    }
  }

  private detectStillness(magnitude: number) {
    // If there's significant movement, update last movement time
    if (magnitude > STILLNESS_THRESHOLD + 9.81) { // Account for gravity
      this.lastMovementTime = Date.now();
      return;
    }

    // Check for prolonged stillness
    const stillnessDuration = Date.now() - this.lastMovementTime;
    if (stillnessDuration > STILLNESS_DURATION) {
      // Only alert once per stillness period
      const recentStillnessAlerts = this.state.alerts.filter(
        a => a.type === 'prolonged_stillness' && 
             Date.now() - a.timestamp < STILLNESS_DURATION * 2
      );
      
      if (recentStillnessAlerts.length === 0) {
        this.addAlert({
          type: 'prolonged_stillness',
          severity: 'medium',
          message: 'No movement detected for 5+ minutes. Please check in.',
          data: { duration: stillnessDuration },
        });
      }
    }
  }

  private lastAltitude: number | null = null;
  private lastAltitudeTime: number | null = null;

  private detectRapidDescent(altitude: number) {
    if (this.lastAltitude !== null && this.lastAltitudeTime !== null) {
      const timeDelta = (Date.now() - this.lastAltitudeTime) / 1000; // seconds
      const altitudeDelta = this.lastAltitude - altitude; // positive = descent
      const descentRate = altitudeDelta / timeDelta;

      if (descentRate > RAPID_DESCENT_RATE && altitudeDelta > 2) {
        this.addAlert({
          type: 'rapid_descent',
          severity: 'high',
          message: 'Rapid altitude decrease detected. Possible fall from height.',
          data: { descentRate, altitudeDelta },
        });
      }
    }

    this.lastAltitude = altitude;
    this.lastAltitudeTime = Date.now();
  }

  private classifyActivity(magnitude: number) {
    // Simple activity classification based on acceleration patterns
    const normalizedMag = magnitude - 9.81; // Remove gravity
    
    if (Math.abs(normalizedMag) < 0.5) {
      this.state.activityMetrics.lastActivityType = 'stationary';
      this.state.activityMetrics.restMinutes += 1/60; // Assuming called ~once per second
    } else if (normalizedMag > 0.5 && normalizedMag < 3) {
      this.state.activityMetrics.lastActivityType = 'walking';
      this.state.activityMetrics.activeMinutes += 1/60;
    } else if (normalizedMag >= 3 && normalizedMag < 8) {
      this.state.activityMetrics.lastActivityType = 'climbing';
      this.state.activityMetrics.activeMinutes += 1/60;
    } else if (this.state.location?.speed && this.state.location.speed > 5) {
      this.state.activityMetrics.lastActivityType = 'vehicle';
    }

    // Estimate calories burned (rough approximation)
    // MET values: sitting=1.3, walking=3.5, climbing=8
    const METs = {
      stationary: 1.3,
      walking: 3.5,
      climbing: 8,
      vehicle: 1.3,
      unknown: 1.5,
    };
    const met = METs[this.state.activityMetrics.lastActivityType];
    const weightKg = 80; // Assume average weight
    // Calories per minute = MET * weight * 3.5 / 200
    this.state.activityMetrics.caloriesBurned += (met * weightKg * 3.5 / 200) / 60;
  }

  private updateDistanceTraveled() {
    if (this.locationHistory.length < 2) return;

    const last = this.locationHistory[this.locationHistory.length - 1];
    const prev = this.locationHistory[this.locationHistory.length - 2];

    const distance = this.calculateDistance(
      prev.latitude, prev.longitude,
      last.latitude, last.longitude
    );

    this.state.activityMetrics.distanceTraveled += distance;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Geofencing for job site boundaries
  addGeofence(latitude: number, longitude: number, radius: number, name: string) {
    this.geofences.push({ latitude, longitude, radius, name });
  }

  removeGeofence(name: string) {
    this.geofences = this.geofences.filter(g => g.name !== name);
  }

  private checkGeofences(location: LocationData) {
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        geofence.latitude, geofence.longitude
      );

      if (distance > geofence.radius) {
        this.addAlert({
          type: 'geofence_breach',
          severity: 'low',
          message: `Left designated work area: ${geofence.name}`,
          data: { geofence, distance },
        });
      }
    }
  }

  private updateActivityMetrics() {
    // Calculate floors climbed from altitude changes
    if (this.state.barometer && this.state.environmental) {
      // Approximately 3 meters per floor
      const floorsFromAltitude = Math.floor(this.state.environmental.altitude / 3);
      if (floorsFromAltitude > this.state.activityMetrics.floorsClimbed) {
        this.state.activityMetrics.floorsClimbed = floorsFromAltitude;
      }
    }

    this.notifyListeners();
  }

  private addAlert(alertData: Omit<SafetyAlert, 'id' | 'timestamp' | 'acknowledged' | 'location'>) {
    const alert: SafetyAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: Date.now(),
      acknowledged: false,
      location: this.state.location || undefined,
    };

    this.state.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.state.alerts.length > 100) {
      this.state.alerts = this.state.alerts.slice(0, 100);
    }

    // Save alert to storage for persistence
    this.saveAlertsToStorage();
    
    this.notifyListeners();
    
    console.log('Safety Alert:', alert);
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.state.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveAlertsToStorage();
      this.notifyListeners();
    }
  }

  private async saveAlertsToStorage() {
    try {
      await AsyncStorage.setItem('safety_alerts', JSON.stringify(this.state.alerts.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save alerts:', e);
    }
  }

  async loadAlertsFromStorage() {
    try {
      const stored = await AsyncStorage.getItem('safety_alerts');
      if (stored) {
        this.state.alerts = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (e) {
      console.error('Failed to load alerts:', e);
    }
  }

  // Get current state
  getState(): SensorServiceState {
    return { ...this.state };
  }

  // Get sensor data for AI analysis
  getSensorDataForAI(): object {
    return {
      deviceInfo: this.state.deviceInfo,
      location: this.state.location,
      environmental: this.state.environmental,
      activityMetrics: this.state.activityMetrics,
      recentAlerts: this.state.alerts.slice(0, 10),
      batteryLevel: this.state.batteryLevel,
      currentMotion: {
        accelerometer: this.state.accelerometer,
        gyroscope: this.state.gyroscope,
      },
    };
  }
}

// Singleton instance
export const sensorService = new SensorService();

// React Hook for using sensor data
export function useSensorData() {
  const [state, setState] = useState<SensorServiceState>(sensorService.getState());

  useEffect(() => {
    const unsubscribe = sensorService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    startMonitoring: () => sensorService.startMonitoring(),
    stopMonitoring: () => sensorService.stopMonitoring(),
    acknowledgeAlert: (id: string) => sensorService.acknowledgeAlert(id),
    addGeofence: (lat: number, lng: number, radius: number, name: string) => 
      sensorService.addGeofence(lat, lng, radius, name),
    removeGeofence: (name: string) => sensorService.removeGeofence(name),
    getSensorDataForAI: () => sensorService.getSensorDataForAI(),
  };
}

export default sensorService;
