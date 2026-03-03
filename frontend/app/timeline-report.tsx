import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import api from '../services/api';
import { format } from 'date-fns';

export default function TimelineReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, [projectId]);

  const loadReport = async () => {
    try {
      const data = await api.getTimelineReport(projectId);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return { name: 'check-circle', color: Colors.success };
      case 'in_progress': return { name: 'schedule', color: Colors.warning };
      default: return { name: 'radio-button-unchecked', color: colors.textSecondary };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
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
          <Text style={styles.headerTitle}>Timeline Report</Text>
          <Text style={styles.headerSubtitle}>{report?.project_name || 'Project'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="timeline" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <GlassCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Schedule Progress</Text>
            <Text style={[styles.progressValue, { color: Colors.primary }]}>
              {(report?.schedule_progress || 0).toFixed(0)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${report?.schedule_progress || 0}%` }]}
            />
          </View>
          <View style={styles.daysInfo}>
            <View style={styles.dayItem}>
              <Text style={[styles.dayValue, { color: colors.text }]}>{report?.elapsed_days || 0}</Text>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>Days Elapsed</Text>
            </View>
            <View style={styles.dayItem}>
              <Text style={[styles.dayValue, { color: Colors.warning }]}>{report?.remaining_days || 0}</Text>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>Days Remaining</Text>
            </View>
            <View style={styles.dayItem}>
              <Text style={[styles.dayValue, { color: colors.text }]}>{report?.total_days || 0}</Text>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>Total Days</Text>
            </View>
          </View>
        </GlassCard>

        {/* Task Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Summary</Text>
        <View style={styles.taskGrid}>
          {[
            { label: 'Completed', value: report?.task_summary?.completed || 0, color: Colors.success },
            { label: 'In Progress', value: report?.task_summary?.in_progress || 0, color: Colors.info },
            { label: 'Pending', value: report?.task_summary?.pending || 0, color: Colors.warning },
            { label: 'Blocked', value: report?.task_summary?.blocked || 0, color: Colors.error },
          ].map((item, i) => (
            <GlassCard key={i} style={styles.taskCard}>
              <Text style={[styles.taskValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.taskLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Milestones */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestones</Text>
        <GlassCard style={styles.milestonesCard}>
          {report?.milestones?.map((milestone: any, index: number) => {
            const icon = getMilestoneIcon(milestone.status);
            return (
              <View key={index} style={styles.milestoneItem}>
                <View style={styles.milestoneLeft}>
                  <MaterialIcons name={icon.name as any} size={24} color={icon.color} />
                  {index < (report.milestones.length - 1) && (
                    <View style={[styles.milestoneLine, { backgroundColor: colors.border }]} />
                  )}
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[styles.milestoneName, { color: colors.text }]}>{milestone.name}</Text>
                  <Text style={[styles.milestoneDate, { color: colors.textSecondary }]}>
                    {milestone.date ? format(new Date(milestone.date), 'MMM dd, yyyy') : 'TBD'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: icon.color + '20' }]}>
                    <Text style={[styles.statusText, { color: icon.color }]}>{milestone.status}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </GlassCard>

        {/* Schedule Status */}
        <GlassCard style={[styles.statusCard, { backgroundColor: report?.on_schedule ? Colors.success + '20' : Colors.warning + '20' }]}>
          <MaterialIcons
            name={report?.on_schedule ? 'check-circle' : 'warning'}
            size={32}
            color={report?.on_schedule ? Colors.success : Colors.warning}
          />
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: report?.on_schedule ? Colors.success : Colors.warning }]}>
              {report?.on_schedule ? 'On Schedule' : 'Behind Schedule'}
            </Text>
            <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
              Projected completion: {report?.projected_completion ? format(new Date(report.projected_completion), 'MMM dd, yyyy') : 'TBD'}
            </Text>
          </View>
        </GlassCard>

        <Text style={[styles.generatedAt, { color: colors.textSecondary }]}>
          Generated: {report?.generated_at ? new Date(report.generated_at).toLocaleString() : 'Now'}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl, ...Shadows.lg },
  backButton: { marginRight: Spacing.md },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  progressCard: { padding: Spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressLabel: { fontSize: Typography.base },
  progressValue: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold },
  progressBar: { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  daysInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg },
  dayItem: { alignItems: 'center' },
  dayValue: { fontSize: Typography.xl, fontWeight: Typography.bold },
  dayLabel: { fontSize: Typography.xs, marginTop: 4 },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.xl, marginBottom: Spacing.md },
  taskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  taskCard: { width: '48%', padding: Spacing.md, alignItems: 'center' },
  taskValue: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold },
  taskLabel: { fontSize: Typography.sm, marginTop: 4 },
  milestonesCard: { padding: Spacing.lg },
  milestoneItem: { flexDirection: 'row', marginBottom: Spacing.lg },
  milestoneLeft: { alignItems: 'center', marginRight: Spacing.md },
  milestoneLine: { width: 2, flex: 1, marginTop: 4 },
  milestoneContent: { flex: 1 },
  milestoneName: { fontSize: Typography.base, fontWeight: Typography.semibold },
  milestoneDate: { fontSize: Typography.sm, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: Spacing.sm },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  statusCard: { flexDirection: 'row', padding: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.md, borderRadius: 16 },
  statusContent: { flex: 1 },
  statusTitle: { fontSize: Typography.lg, fontWeight: Typography.bold },
  statusDesc: { fontSize: Typography.sm, marginTop: 4 },
  generatedAt: { fontSize: Typography.xs, textAlign: 'center', marginTop: Spacing.xl },
});
