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

export default function MaterialsReportScreen() {
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
      const data = await api.getMaterialsReport(projectId);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return Colors.success;
      case 'low_stock': return Colors.warning;
      case 'pending_delivery': return Colors.info;
      case 'ordered': return Colors.secondary;
      default: return colors.textSecondary;
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
        colors={[Colors.secondary, Colors.secondaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Materials Report</Text>
          <Text style={styles.headerSubtitle}>{report?.project_name || 'Project'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="inventory" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{report?.summary?.in_stock || 0}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>In Stock</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>{report?.summary?.low_stock || 0}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Low Stock</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: Colors.info }]}>{report?.summary?.pending || 0}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pending</Text>
          </GlassCard>
        </View>

        {/* Cost Summary */}
        <GlassCard style={styles.costCard}>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Materials Cost</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>${(report?.total_materials_cost || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Budget Allocation</Text>
            <Text style={[styles.costValue, { color: colors.text }]}>${(report?.budget_allocation || 0).toLocaleString()}</Text>
          </View>
          <View style={[styles.costRow, styles.costRowLast]}>
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>Variance</Text>
            <Text style={[styles.costValue, { color: (report?.variance || 0) > 0 ? Colors.error : Colors.success }]}>
              {(report?.variance || 0) > 0 ? '+' : ''}${(report?.variance || 0).toLocaleString()}
            </Text>
          </View>
        </GlassCard>

        {/* Alerts */}
        {report?.alerts?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Alerts</Text>
            {report.alerts.map((alert: any, i: number) => (
              <GlassCard key={i} style={[styles.alertCard, { borderLeftColor: alert.severity === 'warning' ? Colors.warning : Colors.info }]}>
                <MaterialIcons
                  name={alert.severity === 'warning' ? 'warning' : 'info'}
                  size={24}
                  color={alert.severity === 'warning' ? Colors.warning : Colors.info}
                />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertItem, { color: colors.text }]}>{alert.item}</Text>
                  <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{alert.message}</Text>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* Materials List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Inventory</Text>
        {report?.materials?.map((material: any, index: number) => (
          <GlassCard key={index} style={styles.materialCard}>
            <View style={styles.materialHeader}>
              <Text style={[styles.materialName, { color: colors.text }]}>{material.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(material.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(material.status) }]}>
                  {material.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <View style={styles.materialStats}>
              <View style={styles.materialStat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ordered</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{material.ordered}</Text>
              </View>
              <View style={styles.materialStat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Delivered</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{material.delivered}</Text>
              </View>
              <View style={styles.materialStat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Used</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{material.used}</Text>
              </View>
              <View style={styles.materialStat}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available</Text>
                <Text style={[styles.statValue, { color: Colors.success }]}>{material.delivered - material.used}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${(material.used / material.ordered) * 100}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {((material.used / material.ordered) * 100).toFixed(0)}% used
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
  summaryLabel: { fontSize: Typography.xs, marginTop: 4 },
  costCard: { padding: Spacing.lg, marginTop: Spacing.md },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(100,100,100,0.1)' },
  costRowLast: { borderBottomWidth: 0 },
  costLabel: { fontSize: Typography.base },
  costValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.xl, marginBottom: Spacing.md },
  alertCard: { flexDirection: 'row', padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 4, gap: Spacing.md },
  alertContent: { flex: 1 },
  alertItem: { fontSize: Typography.base, fontWeight: Typography.semibold },
  alertMessage: { fontSize: Typography.sm, marginTop: 2 },
  materialCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  materialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  materialName: { fontSize: Typography.base, fontWeight: Typography.semibold, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  materialStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  materialStat: { alignItems: 'center' },
  statLabel: { fontSize: 10 },
  statValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: Typography.xs, minWidth: 50 },
  generatedAt: { fontSize: Typography.xs, textAlign: 'center', marginTop: Spacing.xl },
});
