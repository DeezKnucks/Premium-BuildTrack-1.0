import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { AnimatedTouchable } from '../components/AnimatedTouchable';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const budgetHealth = stats?.budget_variance || 0;
  const completionRate = stats?.total_tasks > 0 ? ((stats.completed_tasks / stats.total_tasks) * 100).toFixed(0) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.info, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>Real-time project insights</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="assessment" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.summaryGradient}>
              <MaterialIcons name="folder" size={28} color="#FFF" />
              <Text style={styles.summaryValue}>{stats?.total_projects || 0}</Text>
              <Text style={styles.summaryLabel}>Total Projects</Text>
            </LinearGradient>
          </GlassCard>

          <GlassCard style={styles.summaryCard}>
            <LinearGradient colors={[Colors.success, '#059669']} style={styles.summaryGradient}>
              <MaterialIcons name="trending-up" size={28} color="#FFF" />
              <Text style={styles.summaryValue}>{stats?.active_projects || 0}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </LinearGradient>
          </GlassCard>
        </View>

        {/* Performance Metrics */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
        
        <GlassCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIcon}>
              <MaterialIcons name="check-circle" size={24} color={Colors.success} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={[styles.metricTitle, { color: colors.text }]}>Task Completion Rate</Text>
              <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
                {stats?.completed_tasks || 0} of {stats?.total_tasks || 0} tasks completed
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={[Colors.success, '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${completionRate}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: Colors.success }]}>{completionRate}%</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIcon}>
              <MaterialIcons name="attach-money" size={24} color={budgetHealth > 0 ? Colors.error : Colors.success} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={[styles.metricTitle, { color: colors.text }]}>Budget Health</Text>
              <Text style={[styles.metricSubtitle, { color: colors.textSecondary }]}>
                ${((stats?.actual_cost || 0) / 1000).toFixed(0)}K spent of ${((stats?.total_budget || 0) / 1000).toFixed(0)}K
              </Text>
            </View>
          </View>
          <View style={styles.budgetIndicator}>
            <Text style={[styles.budgetVariance, { color: budgetHealth > 0 ? Colors.error : Colors.success }]}>
              {budgetHealth > 0 ? '+' : ''}{budgetHealth.toFixed(1)}%
            </Text>
            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
              {budgetHealth > 0 ? 'Over Budget' : 'Under Budget'}
            </Text>
          </View>
        </GlassCard>

        {/* Report Types */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Reports</Text>

        <View style={styles.reportGrid}>
          {[
            { icon: 'pie-chart', title: 'Budget Report', desc: 'Cost breakdown & forecasts', color: Colors.success },
            { icon: 'timeline', title: 'Timeline Report', desc: 'Schedule & milestones', color: Colors.info },
            { icon: 'group', title: 'Team Report', desc: 'Productivity & hours', color: Colors.warning },
            { icon: 'inventory', title: 'Materials Report', desc: 'Usage & inventory', color: Colors.secondary },
            { icon: 'security', title: 'Safety Report', desc: 'Incidents & compliance', color: Colors.error },
            { icon: 'eco', title: 'Sustainability', desc: 'Environmental metrics', color: '#10B981' },
          ].map((report, index) => (
            <AnimatedTouchable
              key={index}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={styles.reportItem}
            >
              <GlassCard style={styles.reportCard}>
                <View style={[styles.reportIcon, { backgroundColor: report.color + '20' }]}>
                  <MaterialIcons name={report.icon as any} size={28} color={report.color} />
                </View>
                <Text style={[styles.reportTitle, { color: colors.text }]}>{report.title}</Text>
                <Text style={[styles.reportDesc, { color: colors.textSecondary }]}>{report.desc}</Text>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </GlassCard>
            </AnimatedTouchable>
          ))}
        </View>

        {/* Export Options */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Options</Text>
        <GlassCard style={styles.exportCard}>
          {[
            { icon: 'picture-as-pdf', title: 'PDF Report', color: Colors.error },
            { icon: 'table-chart', title: 'Excel Export', color: Colors.success },
            { icon: 'email', title: 'Email Report', color: Colors.info },
          ].map((opt, i) => (
            <TouchableOpacity key={i} style={styles.exportOption}>
              <View style={[styles.exportIcon, { backgroundColor: opt.color + '20' }]}>
                <MaterialIcons name={opt.icon as any} size={24} color={opt.color} />
              </View>
              <Text style={[styles.exportTitle, { color: colors.text }]}>{opt.title}</Text>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.lg,
  },
  backButton: { marginRight: Spacing.md },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  summaryCard: { flex: 1, padding: 0, overflow: 'hidden' },
  summaryGradient: { padding: Spacing.lg, alignItems: 'center' },
  summaryValue: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: '#FFF', marginTop: Spacing.sm },
  summaryLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginBottom: Spacing.md, marginTop: Spacing.md },
  metricCard: { marginBottom: Spacing.md, padding: Spacing.lg },
  metricHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  metricIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.success + '20', justifyContent: 'center', alignItems: 'center' },
  metricInfo: { flex: 1, marginLeft: Spacing.md },
  metricTitle: { fontSize: Typography.base, fontWeight: Typography.bold },
  metricSubtitle: { fontSize: Typography.sm, marginTop: 2 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: Typography.base, fontWeight: Typography.bold, minWidth: 50, textAlign: 'right' },
  budgetIndicator: { alignItems: 'flex-end' },
  budgetVariance: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold },
  budgetLabel: { fontSize: Typography.sm },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  reportItem: { width: (width - 48 - 16) / 2 },
  reportCard: { padding: Spacing.base, alignItems: 'center' },
  reportIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  reportTitle: { fontSize: Typography.base, fontWeight: Typography.bold, textAlign: 'center' },
  reportDesc: { fontSize: Typography.xs, textAlign: 'center', marginTop: 4 },
  comingSoonBadge: { backgroundColor: Colors.warning + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: Spacing.sm },
  comingSoonText: { fontSize: 10, color: Colors.warning, fontWeight: '700' },
  exportCard: { padding: 0, overflow: 'hidden' },
  exportOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: 'rgba(100,100,100,0.1)' },
  exportIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  exportTitle: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semibold, marginLeft: Spacing.md },
});
