import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function BudgetReportScreen() {
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
      const data = await api.getBudgetReport(projectId);
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

  const varianceColor = (report?.variance_percentage || 0) > 0 ? Colors.error : Colors.success;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.success, '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Budget Report</Text>
          <Text style={styles.headerSubtitle}>{report?.project_name || 'Project'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="pie-chart" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Budget</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${((report?.total_budget || 0) / 1000).toFixed(0)}K
            </Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Spent</Text>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>
              ${((report?.total_spent || 0) / 1000).toFixed(0)}K
            </Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Remaining</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              ${((report?.remaining || 0) / 1000).toFixed(0)}K
            </Text>
          </GlassCard>
        </View>

        {/* Variance Indicator */}
        <GlassCard style={styles.varianceCard}>
          <View style={styles.varianceHeader}>
            <MaterialIcons name="trending-up" size={28} color={varianceColor} />
            <Text style={[styles.varianceValue, { color: varianceColor }]}>
              {(report?.variance_percentage || 0) > 0 ? '+' : ''}{(report?.variance_percentage || 0).toFixed(1)}%
            </Text>
          </View>
          <Text style={[styles.varianceLabel, { color: colors.textSecondary }]}>
            {(report?.variance_percentage || 0) > 0 ? 'Over Budget' : 'Under Budget'}
          </Text>
        </GlassCard>

        {/* Category Breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
        {report?.categories && Object.entries(report.categories).map(([name, data]: [string, any]) => (
          <GlassCard key={name} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.categoryAmount, { color: colors.text }]}>
                ${(data.spent / 1000).toFixed(0)}K / ${(data.budget / 1000).toFixed(0)}K
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={data.spent > data.budget ? [Colors.error, '#DC2626'] : [Colors.success, '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min((data.spent / data.budget) * 100, 100)}%` }]}
              />
            </View>
            <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>
              {((data.spent / data.budget) * 100).toFixed(0)}% utilized
            </Text>
          </GlassCard>
        ))}

        {/* Monthly Trend */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Spending Trend</Text>
        <GlassCard style={styles.trendCard}>
          <View style={styles.trendChart}>
            {report?.monthly_trend?.map((month: any, index: number) => (
              <View key={month.month} style={styles.trendBar}>
                <View style={styles.barContainer}>
                  <View style={[styles.plannedBar, { height: `${(month.planned / (report.total_budget * 0.3)) * 100}%` }]} />
                  <View style={[styles.actualBar, { height: `${(month.actual / (report.total_budget * 0.3)) * 100}%` }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{month.month}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Planned</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Actual</Text>
            </View>
          </View>
        </GlassCard>

        {/* Forecast */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Forecast</Text>
        <GlassCard style={styles.forecastCard}>
          <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
          <View style={styles.forecastContent}>
            <Text style={[styles.forecastText, { color: colors.text }]}>
              Projected Total: ${((report?.forecast?.projected_total || 0) / 1000).toFixed(0)}K
            </Text>
            <Text style={[styles.forecastRecommendation, { color: colors.textSecondary }]}>
              {report?.forecast?.recommendation}
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
  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryCard: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  summaryLabel: { fontSize: Typography.xs, marginBottom: 4 },
  summaryValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  varianceCard: { padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.md },
  varianceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  varianceValue: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold },
  varianceLabel: { fontSize: Typography.sm, marginTop: 4 },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.xl, marginBottom: Spacing.md },
  categoryCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  categoryName: { fontSize: Typography.base, fontWeight: Typography.semibold },
  categoryAmount: { fontSize: Typography.sm },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  categoryPercentage: { fontSize: Typography.xs, marginTop: 4, textAlign: 'right' },
  trendCard: { padding: Spacing.lg },
  trendChart: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' },
  trendBar: { alignItems: 'center', flex: 1 },
  barContainer: { flexDirection: 'row', gap: 4, height: 100, alignItems: 'flex-end' },
  plannedBar: { width: 12, backgroundColor: Colors.info, borderRadius: 2 },
  actualBar: { width: 12, backgroundColor: Colors.success, borderRadius: 2 },
  barLabel: { fontSize: 10, marginTop: 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginTop: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: Typography.xs },
  forecastCard: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.md },
  forecastContent: { flex: 1 },
  forecastText: { fontSize: Typography.base, fontWeight: Typography.bold },
  forecastRecommendation: { fontSize: Typography.sm, marginTop: 4 },
  generatedAt: { fontSize: Typography.xs, textAlign: 'center', marginTop: Spacing.xl },
});
