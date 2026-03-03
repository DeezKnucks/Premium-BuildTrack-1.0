import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification types
export type NotificationType = 
  | 'safety_alert'
  | 'task_reminder'
  | 'project_update'
  | 'team_message'
  | 'weather_alert'
  | 'budget_warning'
  | 'deadline_approaching'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: number;
  actionUrl?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  safetyAlerts: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  teamMessages: boolean;
  weatherAlerts: boolean;
  budgetWarnings: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number; // Hour (0-23)
  quietHoursEnd: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

export interface PushNotificationState {
  isPermissionGranted: boolean;
  pushToken: string | null;
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  safetyAlerts: true,
  taskReminders: true,
  projectUpdates: true,
  teamMessages: true,
  weatherAlerts: true,
  budgetWarnings: true,
  quietHoursEnabled: false,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  vibrationEnabled: true,
  soundEnabled: true,
};

class PushNotificationService {
  private listeners: ((state: PushNotificationState) => void)[] = [];
  private notificationListener: any = null;
  private responseListener: any = null;

  private state: PushNotificationState = {
    isPermissionGranted: false,
    pushToken: null,
    notifications: [],
    unreadCount: 0,
    preferences: DEFAULT_PREFERENCES,
    isLoading: true,
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Load saved preferences
      const savedPrefs = await AsyncStorage.getItem('notification_preferences');
      if (savedPrefs) {
        this.state.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) };
      }

      // Load saved notifications
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        this.state.notifications = JSON.parse(savedNotifications);
        this.updateUnreadCount();
      }

      // Check for existing permissions
      const { status } = await Notifications.getPermissionsAsync();
      this.state.isPermissionGranted = status === 'granted';

      if (this.state.isPermissionGranted) {
        await this.getPushToken();
      }

      // Set up notification listeners
      this.setupListeners();

      this.state.isLoading = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  subscribe(listener: (state: PushNotificationState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  private updateUnreadCount() {
    this.state.unreadCount = this.state.notifications.filter(n => !n.read).length;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.state.isPermissionGranted = finalStatus === 'granted';

      if (finalStatus === 'granted') {
        await this.getPushToken();
      }

      this.notifyListeners();
      return this.state.isPermissionGranted;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  // Get push token for this device
  private async getPushToken() {
    try {
      // For Expo, use getExpoPushTokenAsync
      // For production, you might use getDevicePushTokenAsync for native tokens
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'buildtrack', // Your Expo project ID
      });
      
      this.state.pushToken = token.data;
      
      // In production, send this token to your backend
      // await api.registerPushToken(token.data);
      
      console.log('Push token:', token.data);
    } catch (error) {
      console.error('Failed to get push token:', error);
    }
  }

  // Set up notification listeners
  private setupListeners() {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const appNotification = this.convertNotification(notification);
      this.addNotification(appNotification);
    });

    // Handle notification interactions (taps)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      this.handleNotificationResponse(data);
    });
  }

  private convertNotification(notification: Notifications.Notification): AppNotification {
    const content = notification.request.content;
    return {
      id: notification.request.identifier,
      type: (content.data?.type as NotificationType) || 'system',
      title: content.title || '',
      body: content.body || '',
      data: content.data,
      read: false,
      createdAt: Date.now(),
      actionUrl: content.data?.actionUrl,
    };
  }

  private handleNotificationResponse(data: any) {
    // Navigate to appropriate screen based on notification type
    if (data?.actionUrl) {
      // Router navigation would happen here
      console.log('Navigate to:', data.actionUrl);
    }
  }

  // Add a notification to the list
  private async addNotification(notification: AppNotification) {
    // Check if notification type is enabled
    if (!this.shouldShowNotification(notification.type)) {
      return;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      return;
    }

    this.state.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.state.notifications.length > 100) {
      this.state.notifications = this.state.notifications.slice(0, 100);
    }

    this.updateUnreadCount();
    await this.saveNotifications();
    this.notifyListeners();
  }

  private shouldShowNotification(type: NotificationType): boolean {
    if (!this.state.preferences.enabled) return false;

    const typeMap: Record<NotificationType, keyof NotificationPreferences> = {
      safety_alert: 'safetyAlerts',
      task_reminder: 'taskReminders',
      project_update: 'projectUpdates',
      team_message: 'teamMessages',
      weather_alert: 'weatherAlerts',
      budget_warning: 'budgetWarnings',
      deadline_approaching: 'taskReminders',
      system: 'enabled',
    };

    const prefKey = typeMap[type];
    return this.state.preferences[prefKey] as boolean;
  }

  private isQuietHours(): boolean {
    if (!this.state.preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const { quietHoursStart, quietHoursEnd } = this.state.preferences;

    if (quietHoursStart < quietHoursEnd) {
      // Normal range (e.g., 22-7 doesn't wrap)
      return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
    } else {
      // Wraps around midnight (e.g., 22-7)
      return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
    }
  }

  private async saveNotifications() {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(this.state.notifications.slice(0, 100)));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    type: NotificationType,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, ...data },
        sound: this.state.preferences.soundEnabled ? 'default' : undefined,
        vibrate: this.state.preferences.vibrationEnabled ? [0, 250, 250, 250] : undefined,
      },
      trigger,
    });

    return id;
  }

  // Schedule a task reminder
  async scheduleTaskReminder(taskId: string, taskTitle: string, dueDate: Date): Promise<string> {
    const reminderTime = new Date(dueDate);
    reminderTime.setHours(reminderTime.getHours() - 1); // 1 hour before

    if (reminderTime <= new Date()) {
      return ''; // Don't schedule if already passed
    }

    return this.scheduleLocalNotification(
      'Task Reminder',
      `"${taskTitle}" is due in 1 hour`,
      'task_reminder',
      { date: reminderTime },
      { taskId, actionUrl: '/tasks' }
    );
  }

  // Schedule a deadline warning
  async scheduleDeadlineWarning(projectId: string, projectName: string, deadline: Date): Promise<string> {
    const warningTime = new Date(deadline);
    warningTime.setDate(warningTime.getDate() - 3); // 3 days before

    if (warningTime <= new Date()) {
      return '';
    }

    return this.scheduleLocalNotification(
      'Deadline Approaching',
      `Project "${projectName}" deadline is in 3 days`,
      'deadline_approaching',
      { date: warningTime },
      { projectId, actionUrl: '/projects' }
    );
  }

  // Send a safety alert notification
  async sendSafetyAlert(title: string, body: string, alertData?: any): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'safety_alert', ...alertData },
        priority: Notifications.AndroidNotificationPriority.MAX,
        sound: 'default',
        vibrate: [0, 500, 200, 500],
      },
      trigger: null, // Immediate
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const notification = this.state.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateUnreadCount();
      await this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all as read
  async markAllAsRead() {
    this.state.notifications.forEach(n => {
      n.read = true;
    });
    this.updateUnreadCount();
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Delete a notification
  async deleteNotification(notificationId: string) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== notificationId);
    this.updateUnreadCount();
    await this.saveNotifications();
    this.notifyListeners();
  }

  // Clear all notifications
  async clearAll() {
    this.state.notifications = [];
    this.state.unreadCount = 0;
    await this.saveNotifications();
    await Notifications.dismissAllNotificationsAsync();
    this.notifyListeners();
  }

  // Update preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.state.preferences));
    this.notifyListeners();
  }

  // Cancel a scheduled notification
  async cancelScheduledNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all scheduled notifications
  async cancelAllScheduled() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get pending scheduled notifications
  async getPendingNotifications() {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  getState(): PushNotificationState {
    return { ...this.state };
  }

  destroy() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Singleton instance
export const pushNotificationService = new PushNotificationService();

// React Hook
export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>(pushNotificationService.getState());

  useEffect(() => {
    const unsubscribe = pushNotificationService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    requestPermissions: () => pushNotificationService.requestPermissions(),
    scheduleTaskReminder: (taskId: string, title: string, dueDate: Date) =>
      pushNotificationService.scheduleTaskReminder(taskId, title, dueDate),
    scheduleDeadlineWarning: (projectId: string, name: string, deadline: Date) =>
      pushNotificationService.scheduleDeadlineWarning(projectId, name, deadline),
    sendSafetyAlert: (title: string, body: string, data?: any) =>
      pushNotificationService.sendSafetyAlert(title, body, data),
    markAsRead: (id: string) => pushNotificationService.markAsRead(id),
    markAllAsRead: () => pushNotificationService.markAllAsRead(),
    deleteNotification: (id: string) => pushNotificationService.deleteNotification(id),
    clearAll: () => pushNotificationService.clearAll(),
    updatePreferences: (prefs: Partial<NotificationPreferences>) =>
      pushNotificationService.updatePreferences(prefs),
    cancelScheduled: (id: string) => pushNotificationService.cancelScheduledNotification(id),
  };
}

export default pushNotificationService;
