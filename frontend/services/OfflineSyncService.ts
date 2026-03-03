import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from './api';

// Database name
const DB_NAME = 'buildtrack_offline.db';

// Sync status
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';

export interface OfflineItem {
  id: string;
  type: 'project' | 'task' | 'media' | 'safety_alert' | 'sensor_data';
  action: 'create' | 'update' | 'delete';
  data: any;
  createdAt: number;
  syncStatus: SyncStatus;
  retryCount: number;
  lastError?: string;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: number | null;
  syncErrors: string[];
}

class OfflineSyncService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private syncInProgress = false;
  private listeners: ((state: SyncState) => void)[] = [];
  private networkUnsubscribe: (() => void) | null = null;

  private state: SyncState = {
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    syncErrors: [],
  };

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Open database
      this.db = await SQLite.openDatabaseAsync(DB_NAME);

      // Create tables
      await this.createTables();

      // Load last sync time
      const lastSync = await AsyncStorage.getItem('last_sync_time');
      if (lastSync) {
        this.state.lastSyncAt = parseInt(lastSync);
      }

      // Setup network listener
      this.networkUnsubscribe = NetInfo.addEventListener(state => {
        const wasOffline = !this.state.isOnline;
        this.state.isOnline = state.isConnected ?? false;
        this.notifyListeners();

        // Auto-sync when coming back online
        if (wasOffline && this.state.isOnline) {
          this.syncAll();
        }
      });

      // Get initial pending count
      await this.updatePendingCount();

      this.isInitialized = true;
      console.log('OfflineSyncService initialized');
    } catch (error) {
      console.error('Failed to initialize OfflineSyncService:', error);
    }
  }

  private async createTables() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        last_error TEXT
      );

      CREATE TABLE IF NOT EXISTS cached_projects (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cached_tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cached_user (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_queue_status ON offline_queue(sync_status);
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON cached_tasks(project_id);
    `);
  }

  subscribe(listener: (state: SyncState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  private async updatePendingCount() {
    if (!this.db) return;

    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM offline_queue WHERE sync_status = 'pending'`
      );
      this.state.pendingCount = result?.count ?? 0;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }

  // Queue an item for offline storage and later sync
  async queueItem(type: OfflineItem['type'], action: OfflineItem['action'], data: any): Promise<string> {
    if (!this.db) await this.initialize();

    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const item: OfflineItem = {
      id,
      type,
      action,
      data,
      createdAt: Date.now(),
      syncStatus: 'pending',
      retryCount: 0,
    };

    try {
      await this.db!.runAsync(
        `INSERT INTO offline_queue (id, type, action, data, created_at, sync_status, retry_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.type, item.action, JSON.stringify(item.data), item.createdAt, item.syncStatus, item.retryCount]
      );

      await this.updatePendingCount();

      // Try to sync immediately if online
      if (this.state.isOnline) {
        this.syncAll();
      }

      return id;
    } catch (error) {
      console.error('Failed to queue item:', error);
      throw error;
    }
  }

  // Cache data locally
  async cacheProjects(projects: any[]) {
    if (!this.db) await this.initialize();

    const now = Date.now();
    for (const project of projects) {
      await this.db!.runAsync(
        `INSERT OR REPLACE INTO cached_projects (id, data, updated_at) VALUES (?, ?, ?)`,
        [project.id || project._id, JSON.stringify(project), now]
      );
    }
  }

  async cacheTasks(tasks: any[]) {
    if (!this.db) await this.initialize();

    const now = Date.now();
    for (const task of tasks) {
      await this.db!.runAsync(
        `INSERT OR REPLACE INTO cached_tasks (id, project_id, data, updated_at) VALUES (?, ?, ?, ?)`,
        [task.id || task._id, task.project_id, JSON.stringify(task), now]
      );
    }
  }

  async cacheUser(user: any) {
    if (!this.db) await this.initialize();

    await this.db!.runAsync(
      `INSERT OR REPLACE INTO cached_user (id, data, updated_at) VALUES (?, ?, ?)`,
      ['current_user', JSON.stringify(user), Date.now()]
    );
  }

  // Get cached data
  async getCachedProjects(): Promise<any[]> {
    if (!this.db) await this.initialize();

    try {
      const results = await this.db!.getAllAsync<{ data: string }>(
        `SELECT data FROM cached_projects ORDER BY updated_at DESC`
      );
      return results.map(r => JSON.parse(r.data));
    } catch (error) {
      console.error('Failed to get cached projects:', error);
      return [];
    }
  }

  async getCachedTasks(projectId?: string): Promise<any[]> {
    if (!this.db) await this.initialize();

    try {
      let query = `SELECT data FROM cached_tasks`;
      const params: any[] = [];

      if (projectId) {
        query += ` WHERE project_id = ?`;
        params.push(projectId);
      }

      query += ` ORDER BY updated_at DESC`;

      const results = await this.db!.getAllAsync<{ data: string }>(query, params);
      return results.map(r => JSON.parse(r.data));
    } catch (error) {
      console.error('Failed to get cached tasks:', error);
      return [];
    }
  }

  async getCachedUser(): Promise<any | null> {
    if (!this.db) await this.initialize();

    try {
      const result = await this.db!.getFirstAsync<{ data: string }>(
        `SELECT data FROM cached_user WHERE id = 'current_user'`
      );
      return result ? JSON.parse(result.data) : null;
    } catch (error) {
      console.error('Failed to get cached user:', error);
      return null;
    }
  }

  // Sync all pending items
  async syncAll() {
    if (!this.db || this.syncInProgress || !this.state.isOnline) return;

    this.syncInProgress = true;
    this.state.isSyncing = true;
    this.state.syncErrors = [];
    this.notifyListeners();

    try {
      // Get all pending items
      const pendingItems = await this.db.getAllAsync<{
        id: string;
        type: string;
        action: string;
        data: string;
        retry_count: number;
      }>(`SELECT * FROM offline_queue WHERE sync_status = 'pending' ORDER BY created_at ASC`);

      for (const item of pendingItems) {
        try {
          await this.syncItem({
            id: item.id,
            type: item.type as OfflineItem['type'],
            action: item.action as OfflineItem['action'],
            data: JSON.parse(item.data),
            createdAt: 0,
            syncStatus: 'pending',
            retryCount: item.retry_count,
          });

          // Mark as synced
          await this.db!.runAsync(
            `UPDATE offline_queue SET sync_status = 'synced' WHERE id = ?`,
            [item.id]
          );
        } catch (error: any) {
          // Update retry count and error
          const newRetryCount = item.retry_count + 1;
          const shouldKeepTrying = newRetryCount < 5;

          await this.db!.runAsync(
            `UPDATE offline_queue SET retry_count = ?, last_error = ?, sync_status = ? WHERE id = ?`,
            [newRetryCount, error.message, shouldKeepTrying ? 'pending' : 'error', item.id]
          );

          this.state.syncErrors.push(`${item.type}: ${error.message}`);
        }
      }

      // Clean up old synced items (keep last 100)
      await this.db.runAsync(`
        DELETE FROM offline_queue 
        WHERE sync_status = 'synced' 
        AND id NOT IN (
          SELECT id FROM offline_queue 
          WHERE sync_status = 'synced' 
          ORDER BY created_at DESC 
          LIMIT 100
        )
      `);

      // Update last sync time
      this.state.lastSyncAt = Date.now();
      await AsyncStorage.setItem('last_sync_time', this.state.lastSyncAt.toString());

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.state.isSyncing = false;
      await this.updatePendingCount();
      this.notifyListeners();
    }
  }

  private async syncItem(item: OfflineItem) {
    switch (item.type) {
      case 'project':
        if (item.action === 'create') {
          await api.createProject(item.data);
        } else if (item.action === 'update') {
          await api.updateProject(item.data.id, item.data);
        }
        break;

      case 'task':
        if (item.action === 'create') {
          await api.createTask(item.data);
        } else if (item.action === 'update') {
          await api.updateTask(item.data.id, item.data);
        }
        break;

      case 'safety_alert':
        await api.submitSafetyAlert(item.data);
        break;

      case 'sensor_data':
        await api.submitSensorData(item.data);
        break;

      default:
        console.warn(`Unknown item type: ${item.type}`);
    }
  }

  // Force refresh from server
  async refreshFromServer() {
    if (!this.state.isOnline) return;

    try {
      // Fetch and cache projects
      const projects = await api.getProjects();
      await this.cacheProjects(projects);

      // Fetch and cache tasks
      const tasks = await api.getTasks();
      await this.cacheTasks(tasks);

      // Fetch and cache user
      const user = await api.getCurrentUser();
      await this.cacheUser(user);

      this.state.lastSyncAt = Date.now();
      await AsyncStorage.setItem('last_sync_time', this.state.lastSyncAt.toString());
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to refresh from server:', error);
    }
  }

  // Get sync state
  getState(): SyncState {
    return { ...this.state };
  }

  // Cleanup
  destroy() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
    this.db?.closeAsync();
  }
}

// Singleton instance
export const offlineSyncService = new OfflineSyncService();

// React Hook
export function useOfflineSync() {
  const [state, setState] = useState<SyncState>(offlineSyncService.getState());

  useEffect(() => {
    offlineSyncService.initialize();
    const unsubscribe = offlineSyncService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    queueItem: (type: OfflineItem['type'], action: OfflineItem['action'], data: any) =>
      offlineSyncService.queueItem(type, action, data),
    syncAll: () => offlineSyncService.syncAll(),
    refreshFromServer: () => offlineSyncService.refreshFromServer(),
    getCachedProjects: () => offlineSyncService.getCachedProjects(),
    getCachedTasks: (projectId?: string) => offlineSyncService.getCachedTasks(projectId),
  };
}

export default offlineSyncService;
