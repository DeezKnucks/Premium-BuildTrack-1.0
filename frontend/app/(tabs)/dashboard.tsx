import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimatedTouchable } from '../../components/AnimatedTouchable';
import { GlassCard } from '../../components/GlassCard';
import { Logo } from '../../components/Logo';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import api from '../../services/api';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  useEffect(() => {
    loadDashboard();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadDashboard = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const [dashboardData, projectsData] = await Promise.all([
        api.getDashboard(),
        api.getProjects(),
      ]);
      setStats(dashboardData);
      setProjects(projectsData.filter((p: any) => p.status === 'active').slice(0, 5));
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

  const handleTaskComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const completionRate = stats?.total_tasks > 0
    ? (stats.completed_tasks / stats.total_tasks) * 100
    : 0;

  const hasHighRisk = Math.abs(stats?.budget_variance || 0) > 10;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header with Logo */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          </View>
          <Logo size={60} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Hero Metrics Cards with 3D Charts */}
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          
          <View style={styles.metricsGrid}>
            {/* Active Projects Card */}
            <GlassCard style={styles.metricCard} gradient>
              <LinearGradient
                colors={[Colors.secondaryDark, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chartCard}
              >
                <Text style={styles.metricValue}>{stats?.active_projects || 0}</Text>
                <Text style={styles.metricLabel}>Active Projects</Text>
                <View style={styles.miniChart}>
                  <MaterialIcons name="folder-open" size={60} color="rgba(255,255,255,0.2)" />
                </View>
              </LinearGradient>
            </GlassCard>

            {/* Task Completion Card */}
            <AnimatedTouchable onPress={handleTaskComplete}>
              <GlassCard style={styles.metricCard} gradient>
                <LinearGradient
                  colors={[Colors.success, '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chartCard}
                >
                  <Text style={styles.metricValue}>{completionRate.toFixed(0)}%</Text>
                  <Text style={styles.metricLabel}>Tasks Complete</Text>
                  <Text style={styles.metricSubtext}>
                    {stats?.completed_tasks || 0} of {stats?.total_tasks || 0}
                  </Text>
                </LinearGradient>
              </GlassCard>
            </AnimatedTouchable>
          </View>

          {/* Budget Variance Card with Pulsing Alert */}
          {hasHighRisk && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <GlassCard style={styles.alertCard}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.alertContent}
                >
                  <View style={styles.alertHeader}>
                    <MaterialIcons name="warning" size={32} color="#FFF" />
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle}>Budget Alert!</Text>
                      <Text style={styles.alertMessage}>
                        {stats?.budget_variance > 0 ? 'Over' : 'Under'} budget by{' '}
                        {Math.abs(stats?.budget_variance || 0).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.alertButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push('/(tabs)/ai');
                    }}
                  >
                    <Text style={styles.alertButtonText}>View AI Analysis</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                  </TouchableOpacity>
                </LinearGradient>
              </GlassCard>
            </Animated.View>
          )}
        </View>

        {/* Swipeable Project Carousel */}
        {projects.length > 0 && (
          <View style={styles.carouselSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Projects</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
                setCurrentProjectIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {projects.map((project, index) => (
                <AnimatedTouchable
                  key={project.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)/projects');
                  }}
                >
                  <GlassCard style={styles.projectCard}>
                    <LinearGradient
                      colors={[colors.card, colors.cardGlass]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.projectCardContent}
                    >
                      {/* Project Image Placeholder */}
                      <View style={styles.projectImage}>
                        <LinearGradient
                          colors={[Colors.primary, Colors.primaryDark]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.projectImageGradient}
                        >
                          <MaterialIcons name="construction" size={48} color="#FFF" />
                        </LinearGradient>
                      </View>

                      <View style={styles.projectInfo}>
                        <Text style={[styles.projectName, { color: colors.text }]}>
                          {project.name}
                        </Text>
                        <View style={styles.projectMeta}>
                          <View style={[styles.statusBadge, { backgroundColor: Colors.success + '20' }]}>
                            <Text style={[styles.statusText, { color: Colors.success }]}>
                              {project.status}
                            </Text>
                          </View>
                          <Text style={[styles.projectBudget, { color: colors.textSecondary }]}>
                            ${(project.budget / 1000).toFixed(0)}K
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <LinearGradient
                              colors={[Colors.primary, Colors.primaryDark]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[
                                styles.progressFill,
                                { width: `${project.completion_percentage}%` },
                              ]}
                            />
                          </View>
                          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {project.completion_percentage}%
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </GlassCard>
                </AnimatedTouchable>
              ))}
            </ScrollView>

            {/* Carousel Indicators */}
            <View style={styles.indicators}>
              {projects.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentProjectIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'add-circle', label: 'New Project', route: '/(tabs)/projects', gradient: [Colors.primary, Colors.primaryDark] },
              { icon: 'camera-alt', label: 'Capture', route: '/(tabs)/capture', gradient: [Colors.success, '#059669'] },
              { icon: 'psychology', label: 'AI Insights', route: '/(tabs)/ai', gradient: [Colors.secondary, Colors.secondaryLight] },
              { icon: 'task', label: 'Tasks', route: '/(tabs)/tasks', gradient: [Colors.warning, '#D97706'] },
            ].map((action, index) => (
              <AnimatedTouchable
                key={index}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(action.route as any);
                }}
              >
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCard}
                >
                  <MaterialIcons name={action.icon as any} size={32} color="#FFF" />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </LinearGradient>
              </AnimatedTouchable>
            ))}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.extrabold,
    color: '#FFF',
    marginTop: Spacing.xs,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.extrabold,
    marginBottom: Spacing.base,
    letterSpacing: 0.5,
  },
  metricsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.base,
  },
  metricCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  chartCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  metricValue: {
    fontSize: Typography['4xl'],
    fontWeight: Typography.black,
    color: '#FFF',
  },
  metricLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
  },
  metricSubtext: {
    fontSize: Typography.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.xs,
  },
  miniChart: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.3,
  },
  alertCard: {
    padding: 0,
    overflow: 'hidden',
    marginTop: Spacing.base,
  },
  alertContent: {
    padding: Spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  alertText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  alertTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.extrabold,
    color: '#FFF',
  },
  alertMessage: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: Spacing.xs,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.base,
    gap: Spacing.sm,
  },
  alertButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#FFF',
  },
  carouselSection: {
    marginTop: Spacing['2xl'],
    paddingLeft: Spacing.lg,
  },
  carouselContent: {
    paddingRight: Spacing.lg,
  },
  projectCard: {
    width: CARD_WIDTH,
    marginRight: Spacing.base,
    padding: 0,
    overflow: 'hidden',
  },
  projectCardContent: {
    padding: Spacing.base,
  },
  projectImage: {
    height: 150,
    borderRadius: BorderRadius.base,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  projectImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    gap: Spacing.sm,
  },
  projectName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    textTransform: 'uppercase',
  },
  projectBudget: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  indicatorActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  actionsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.base,
  },
  actionCard: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  actionLabel: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#FFF',
    marginTop: Spacing.sm,
  },
});
