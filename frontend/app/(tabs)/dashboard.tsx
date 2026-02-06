import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const completionRate = stats?.total_tasks > 0
    ? (stats.completed_tasks / stats.total_tasks) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.avatarButton}>
          <MaterialIcons name="account-circle" size={48} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <MaterialIcons name="construction" size={32} color="#FF6B35" />
            <Text style={styles.statValue}>{stats?.active_projects || 0}</Text>
            <Text style={styles.statLabel}>Active Projects</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="task-alt" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{stats?.completed_tasks || 0}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="folder" size={32} color="#2196F3" />
            <Text style={styles.statValue}>{stats?.total_projects || 0}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons
              name={stats?.budget_variance < 0 ? 'trending-down' : 'trending-up'}
              size={32}
              color={stats?.budget_variance < 0 ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.statValue}>
              {Math.abs(stats?.budget_variance || 0).toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Budget Variance</Text>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Completion</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {stats?.completed_tasks || 0} of {stats?.total_tasks || 0} tasks completed
              </Text>
              <Text style={styles.progressPercentage}>
                {completionRate.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completionRate}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Recent Alerts */}
        {stats?.recent_alerts && stats.recent_alerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {stats.recent_alerts.slice(0, 3).map((alert: any) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertIcon}>
                  <MaterialIcons
                    name={
                      alert.severity === 'high'
                        ? 'warning'
                        : alert.severity === 'critical'
                        ? 'error'
                        : 'info'
                    }
                    size={24}
                    color={
                      alert.severity === 'high' || alert.severity === 'critical'
                        ? '#F44336'
                        : '#FF9800'
                    }
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {alert.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Deadlines */}
        {stats?.upcoming_deadlines && stats.upcoming_deadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            {stats.upcoming_deadlines.slice(0, 5).map((item: any) => (
              <View key={item.task_id} style={styles.deadlineCard}>
                <View style={styles.deadlineDate}>
                  <Text style={styles.deadlineDay}>{item.days_until_due}</Text>
                  <Text style={styles.deadlineDayLabel}>days</Text>
                </View>
                <View style={styles.deadlineContent}>
                  <Text style={styles.deadlineTitle}>{item.title}</Text>
                  <Text style={styles.deadlineSubtitle}>
                    Due: {new Date(item.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/projects')}
            >
              <MaterialIcons name="add-circle" size={32} color="#FF6B35" />
              <Text style={styles.actionText}>New Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/capture')}
            >
              <MaterialIcons name="camera-alt" size={32} color="#FF6B35" />
              <Text style={styles.actionText}>Capture Media</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/ai')}
            >
              <MaterialIcons name="psychology" size={32} color="#FF6B35" />
              <Text style={styles.actionText}>AI Insights</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <MaterialIcons name="group" size={32} color="#FF6B35" />
              <Text style={styles.actionText}>Team Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#999',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  statCardPrimary: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#FFF',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#999',
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  deadlineDate: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deadlineDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  deadlineDayLabel: {
    fontSize: 12,
    color: '#999',
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  deadlineSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
    textAlign: 'center',
  },
});