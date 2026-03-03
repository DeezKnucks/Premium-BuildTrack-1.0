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

export default function SafetyReportScreen() {
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
      const data = await api.getSafetyReport(projectId);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      default: return Colors.success;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={[Colors.error, '#DC2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Safety Report</Text>
          <Text style={styles.headerSubtitle}>{report?.project_name || 'Project'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="security" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Days Without Incident */}
        <GlassCard style={styles.highlightCard}>
          <LinearGradient colors={[Colors.success, '#059669']} style={styles.highlightGradient}>
            <Text style={styles.highlightValue}>{report?.safety_metrics?.days_without_incident || 0}</Text>
            <Text style={styles.highlightLabel}>Days Without Incident</Text>
          </LinearGradient>
        </GlassCard>

        {/* Incident Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Incident Summary</Text>
        <View style={styles.summaryGrid}>
          {[
            { label: 'Total Incidents', value: report?.incident_summary?.total_incidents || 0, color: Colors.error },
            { label: 'Near Misses', value: report?.incident_summary?.near_misses || 0, color: Colors.warning },
            { label: 'First Aid', value: report?.incident_summary?.first_aid_cases || 0, color: Colors.info },
            { label: 'Lost Time', value: report?.incident_summary?.lost_time_incidents || 0, color: Colors.error },
          ].map((item, i) => (
            <GlassCard key={i} style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Safety Metrics */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Safety Metrics</Text>
        <GlassCard style={styles.metricsCard}>
          {[
            { label: 'Safety Training Completion', value: report?.safety_metrics?.safety_training_completion || 0 },
            { label: 'PPE Compliance', value: report?.safety_metrics?.ppe_compliance || 0 },
            { label: 'Safety Inspection Score', value: report?.safety_metrics?.safety_inspection_score || 0 },
          ].map((metric, i) => (
            <View key={i} style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Text style={[styles.metricLabel, { color: colors.text }]}>{metric.label}</Text>
                <Text style={[styles.metricValue, { color: metric.value >= 90 ? Colors.success : Colors.warning }]}>
                  {metric.value}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <LinearGradient
                  colors={metric.value >= 90 ? [Colors.success, '#059669'] : [Colors.warning, '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${metric.value}%` }]}
                />
              </View>
            </View>
          ))}
        </GlassCard>

        {/* Recent Incidents */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Incidents</Text>
        {report?.incidents?.map((incident: any, i: number) => (
          <GlassCard key={i} style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <View style={[styles.severityDot, { backgroundColor: getSeverityColor(incident.severity) }]} />
              <Text style={[styles.incidentType, { color: colors.text }]}>{incident.type}</Text>
              <Text style={[styles.incidentDate, { color: colors.textSecondary }]}>{incident.date}</Text>
            </View>
            <Text style={[styles.incidentDesc, { color: colors.textSecondary }]}>{incident.description}</Text>
            <View style={[styles.statusTag, { backgroundColor: incident.status === 'resolved' ? Colors.success + '20' : Colors.warning + '20' }]}>
              <Text style={[styles.statusTagText, { color: incident.status === 'resolved' ? Colors.success : Colors.warning }]}>
                {incident.status}
              </Text>
            </View>
          </GlassCard>
        ))}

        {/* Compliance Status */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Compliance Status</Text>
        <GlassCard style={[styles.complianceCard, { backgroundColor: report?.compliance_status?.osha_compliant ? Colors.success + '10' : Colors.error + '10' }]}>
          <MaterialIcons
            name={report?.compliance_status?.osha_compliant ? 'verified' : 'warning'}
            size={48}
            color={report?.compliance_status?.osha_compliant ? Colors.success : Colors.error}
          />
          <Text style={[styles.complianceTitle, { color: report?.compliance_status?.osha_compliant ? Colors.success : Colors.error }]}>
            {report?.compliance_status?.osha_compliant ? 'OSHA Compliant' : 'Compliance Issues'}
          </Text>
          <Text style={[styles.complianceInfo, { color: colors.textSecondary }]}>
            Last Inspection: {report?.compliance_status?.last_inspection_date}
          </Text>
          <Text style={[styles.complianceInfo, { color: colors.textSecondary }]}>
            Next Inspection: {report?.compliance_status?.next_inspection_due}
          </Text>
        </GlassCard>

        {/* Recommendations */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
        {report?.recommendations?.map((rec: string, i: number) => (
          <GlassCard key={i} style={styles.recCard}>
            <MaterialIcons name="lightbulb" size={20} color={Colors.warning} />
            <Text style={[styles.recText, { color: colors.text }]}>{rec}</Text>
          </GlassCard>
        ))}

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
  highlightCard: { padding: 0, overflow: 'hidden' },
  highlightGradient: { padding: Spacing.xl, alignItems: 'center' },
  highlightValue: { fontSize: 64, fontWeight: 'bold', color: '#FFF' },
  highlightLabel: { fontSize: Typography.lg, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.sm },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.xl, marginBottom: Spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  summaryCard: { width: '48%', padding: Spacing.md, alignItems: 'center' },
  summaryValue: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold },
  summaryLabel: { fontSize: Typography.xs, marginTop: 4, textAlign: 'center' },
  metricsCard: { padding: Spacing.lg },
  metricItem: { marginBottom: Spacing.lg },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  metricLabel: { fontSize: Typography.sm },
  metricValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  incidentCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  incidentHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  incidentType: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semibold },
  incidentDate: { fontSize: Typography.xs },
  incidentDesc: { fontSize: Typography.sm, marginTop: Spacing.sm },
  statusTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: Spacing.sm },
  statusTagText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  complianceCard: { padding: Spacing.xl, alignItems: 'center', borderRadius: 16 },
  complianceTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, marginTop: Spacing.md },
  complianceInfo: { fontSize: Typography.sm, marginTop: Spacing.sm },
  recCard: { flexDirection: 'row', padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.md },
  recText: { flex: 1, fontSize: Typography.sm, lineHeight: 20 },
});
