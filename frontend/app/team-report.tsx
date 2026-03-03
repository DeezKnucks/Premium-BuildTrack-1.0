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

export default function TeamReportScreen() {
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
      const data = await api.getTeamReport(projectId);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={[Colors.warning, '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Team Report</Text>
          <Text style={styles.headerSubtitle}>{report?.project_name || 'Project'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="group" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{report?.total_team_members || 0}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Team Members</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{report?.total_hours_logged || 0}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Hours Logged</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>{(report?.overall_productivity || 0).toFixed(0)}%</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Productivity</Text>
          </GlassCard>
        </View>

        {/* Top Performers */}
        {report?.top_performers?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Performers</Text>
            {report.top_performers.map((member: any, index: number) => (
              <GlassCard key={member.id || index} style={styles.topPerformerCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <LinearGradient
                  colors={index === 0 ? ['#FFD700', '#FFA500'] : index === 1 ? ['#C0C0C0', '#A0A0A0'] : ['#CD7F32', '#8B4513']}
                  style={styles.performerAvatar}
                >
                  <Text style={styles.performerInitial}>{member.name?.charAt(0) || 'U'}</Text>
                </LinearGradient>
                <View style={styles.performerInfo}>
                  <Text style={[styles.performerName, { color: colors.text }]}>{member.name}</Text>
                  <Text style={[styles.performerRole, { color: colors.textSecondary }]}>{member.role}</Text>
                </View>
                <View style={styles.performerStats}>
                  <Text style={[styles.performerScore, { color: Colors.success }]}>{member.productivity_score?.toFixed(0)}%</Text>
                  <Text style={[styles.performerScoreLabel, { color: colors.textSecondary }]}>Score</Text>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* All Team Members */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Team Members</Text>
        {report?.team_stats?.map((member: any, index: number) => (
          <GlassCard key={member.id || index} style={styles.memberCard}>
            <View style={[styles.memberAvatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.memberInitial}>{member.name?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
              <View style={styles.memberStats}>
                <View style={styles.statItem}>
                  <MaterialIcons name="assignment" size={14} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>{member.tasks_assigned} tasks</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="check-circle" size={14} color={Colors.success} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>{member.tasks_completed} done</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="schedule" size={14} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>{member.hours_logged}h</Text>
                </View>
              </View>
            </View>
            <View style={styles.completionRate}>
              <Text style={[styles.completionValue, { color: member.completion_rate >= 80 ? Colors.success : Colors.warning }]}>
                {member.completion_rate?.toFixed(0)}%
              </Text>
            </View>
          </GlassCard>
        ))}

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
  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryCard: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  summaryValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  summaryLabel: { fontSize: Typography.xs, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.xl, marginBottom: Spacing.md },
  topPerformerCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, marginBottom: Spacing.sm },
  rankBadge: { position: 'absolute', top: -5, left: -5, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  rankText: { fontSize: 10, fontWeight: 'bold', color: '#FFF' },
  performerAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  performerInitial: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  performerInfo: { flex: 1, marginLeft: Spacing.md },
  performerName: { fontSize: Typography.base, fontWeight: Typography.bold },
  performerRole: { fontSize: Typography.sm, textTransform: 'capitalize' },
  performerStats: { alignItems: 'center' },
  performerScore: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  performerScoreLabel: { fontSize: Typography.xs },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, marginBottom: Spacing.sm },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  memberInitial: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  memberInfo: { flex: 1, marginLeft: Spacing.md },
  memberName: { fontSize: Typography.base, fontWeight: Typography.semibold },
  memberRole: { fontSize: Typography.sm, textTransform: 'capitalize' },
  memberStats: { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11 },
  completionRate: { alignItems: 'center' },
  completionValue: { fontSize: Typography.lg, fontWeight: Typography.bold },
  generatedAt: { fontSize: Typography.xs, textAlign: 'center', marginTop: Spacing.xl },
});
