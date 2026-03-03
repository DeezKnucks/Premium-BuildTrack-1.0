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

export default function SustainabilityReportScreen() {
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
      const data = await api.getSustainabilityReport(projectId);
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

  const getInitiativeColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'in_progress': return Colors.warning;
      default: return Colors.info;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Sustainability</Text>
          <Text style={styles.headerSubtitle}>{report?.project_name || 'Project'}</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="eco" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Environmental Metrics */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Environmental Impact</Text>
        <View style={styles.metricsGrid}>
          {[
            { icon: 'cloud', label: 'Carbon Footprint', value: `${report?.environmental_metrics?.carbon_footprint_tons || 0} tons`, color: Colors.info },
            { icon: 'flash-on', label: 'Energy Usage', value: `${((report?.environmental_metrics?.energy_usage_kwh || 0) / 1000).toFixed(0)}K kWh`, color: Colors.warning },
            { icon: 'water-drop', label: 'Water Usage', value: `${((report?.environmental_metrics?.water_usage_gallons || 0) / 1000).toFixed(0)}K gal`, color: Colors.info },
            { icon: 'delete', label: 'Waste Diverted', value: `${report?.environmental_metrics?.waste_diverted_percentage || 0}%`, color: Colors.success },
          ].map((metric, i) => (
            <GlassCard key={i} style={styles.metricCard}>
              <MaterialIcons name={metric.icon as any} size={28} color={metric.color} />
              <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{metric.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* LEED Certification Progress */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>LEED Certification</Text>
        <GlassCard style={styles.leedCard}>
          <View style={styles.leedHeader}>
            <View>
              <Text style={[styles.leedTarget, { color: colors.text }]}>Target: {report?.certifications?.leed_target}</Text>
              <Text style={[styles.leedPoints, { color: Colors.success }]}>
                {report?.certifications?.current_points} / {report?.certifications?.required_points} points
              </Text>
            </View>
            <View style={styles.leedBadge}>
              <MaterialIcons name="verified" size={40} color="#FFD700" />
            </View>
          </View>
          
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${(report?.certifications?.current_points / report?.certifications?.required_points) * 100}%` }]}
            />
          </View>

          <View style={styles.categoriesGrid}>
            {report?.certifications?.categories?.map((cat: any, i: number) => (
              <View key={i} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                  <Text style={[styles.categoryPoints, { color: Colors.success }]}>{cat.points}/{cat.max}</Text>
                </View>
                <View style={[styles.categoryBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.categoryFill, { width: `${(cat.points / cat.max) * 100}%`, backgroundColor: Colors.success }]} />
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Recycling Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recycling Summary</Text>
        <GlassCard style={styles.recyclingCard}>
          {report?.recycling_summary && Object.entries(report.recycling_summary).map(([material, data]: [string, any], i) => (
            <View key={i} style={styles.recyclingItem}>
              <View style={[styles.recyclingIcon, { backgroundColor: Colors.success + '20' }]}>
                <MaterialIcons name="recycling" size={20} color={Colors.success} />
              </View>
              <Text style={[styles.recyclingMaterial, { color: colors.text }]}>{material.charAt(0).toUpperCase() + material.slice(1)}</Text>
              <Text style={[styles.recyclingValue, { color: Colors.success }]}>{data.recycled} {data.unit}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Green Initiatives */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Green Initiatives</Text>
        {report?.green_initiatives?.map((initiative: any, i: number) => (
          <GlassCard key={i} style={styles.initiativeCard}>
            <View style={styles.initiativeHeader}>
              <MaterialIcons name="eco" size={24} color={getInitiativeColor(initiative.status)} />
              <View style={styles.initiativeInfo}>
                <Text style={[styles.initiativeName, { color: colors.text }]}>{initiative.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getInitiativeColor(initiative.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getInitiativeColor(initiative.status) }]}>{initiative.status}</Text>
                </View>
              </View>
            </View>
            <View style={styles.impactBadge}>
              <MaterialIcons name="trending-down" size={16} color={Colors.success} />
              <Text style={[styles.impactText, { color: Colors.success }]}>{initiative.impact}</Text>
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
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.lg, marginBottom: Spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: { width: '48%', padding: Spacing.md, alignItems: 'center' },
  metricValue: { fontSize: Typography.lg, fontWeight: Typography.extrabold, marginTop: Spacing.sm },
  metricLabel: { fontSize: Typography.xs, marginTop: 4, textAlign: 'center' },
  leedCard: { padding: Spacing.lg },
  leedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  leedTarget: { fontSize: Typography.lg, fontWeight: Typography.bold },
  leedPoints: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold },
  leedBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,215,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  progressBar: { height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: Spacing.lg },
  progressFill: { height: '100%', borderRadius: 6 },
  categoriesGrid: { gap: Spacing.md },
  categoryItem: {},
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryName: { fontSize: Typography.sm },
  categoryPoints: { fontSize: Typography.sm, fontWeight: Typography.bold },
  categoryBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  categoryFill: { height: '100%', borderRadius: 3 },
  recyclingCard: { padding: Spacing.lg },
  recyclingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(100,100,100,0.1)' },
  recyclingIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  recyclingMaterial: { flex: 1, marginLeft: Spacing.md, fontSize: Typography.base, fontWeight: Typography.semibold },
  recyclingValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  initiativeCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  initiativeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  initiativeInfo: { flex: 1 },
  initiativeName: { fontSize: Typography.base, fontWeight: Typography.semibold },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  impactBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(100,100,100,0.1)' },
  impactText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  generatedAt: { fontSize: Typography.xs, textAlign: 'center', marginTop: Spacing.xl },
});
