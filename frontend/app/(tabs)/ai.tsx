import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import api from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTouchable } from '../../components/AnimatedTouchable';

export default function AIScreen() {
  const { colors } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [riskData, setRiskData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'risk' | 'budget' | 'schedule'>('risk');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.filter((p: any) => p.status === 'active'));
      if (data.length > 0) setSelectedProject(data[0].id);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const analyzeRisk = async () => {
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const data = await api.predictRisks(selectedProject);
      setRiskData(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze risk');
    } finally {
      setLoading(false);
    }
  };

  const analyzeBudget = async () => {
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const data = await api.analyzeBudget(selectedProject);
      setBudgetData(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze budget');
    } finally {
      setLoading(false);
    }
  };

  const optimizeSchedule = async () => {
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const data = await api.optimizeSchedule(selectedProject);
      setScheduleData(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to optimize schedule');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return Colors.error;
    if (score >= 40) return Colors.warning;
    return Colors.success;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Premium Header */}
      <LinearGradient
        colors={[Colors.secondary, Colors.secondaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>AI Insights</Text>
          <Text style={styles.headerSubtitle}>Powered by GPT-5.2</Text>
        </View>
        <View style={styles.aiIcon}>
          <MaterialIcons name="auto-awesome" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {projects.length === 0 ? (
              <Text style={[styles.noProjects, { color: colors.textSecondary }]}>No active projects. Create one first!</Text>
            ) : (
              projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.projectChip, selectedProject === project.id && styles.projectChipActive]}
                  onPress={() => {
                    setSelectedProject(project.id);
                    setRiskData(null);
                    setBudgetData(null);
                    setScheduleData(null);
                  }}
                >
                  <Text style={[styles.projectChipText, selectedProject === project.id && styles.projectChipTextActive]}>
                    {project.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* AI Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={[styles.tab, activeTab === 'risk' && styles.tabActive]} onPress={() => setActiveTab('risk')}>
            <MaterialIcons name="warning" size={20} color={activeTab === 'risk' ? Colors.error : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'risk' && { color: Colors.error }]}>Risk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, activeTab === 'budget' && styles.tabActive]} onPress={() => setActiveTab('budget')}>
            <MaterialIcons name="account-balance-wallet" size={20} color={activeTab === 'budget' ? Colors.success : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'budget' && { color: Colors.success }]}>Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, activeTab === 'schedule' && styles.tabActive]} onPress={() => setActiveTab('schedule')}>
            <MaterialIcons name="schedule" size={20} color={activeTab === 'schedule' ? Colors.info : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'schedule' && { color: Colors.info }]}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Risk Tab */}
        {activeTab === 'risk' && (
          <View style={styles.section}>
            <AnimatedTouchable onPress={analyzeRisk} disabled={loading || !selectedProject}>
              <LinearGradient colors={[Colors.error, '#DC2626']} style={[styles.analyzeButton, (!selectedProject || loading) && styles.buttonDisabled]}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <MaterialIcons name="analytics" size={24} color="#FFF" />
                    <Text style={styles.analyzeButtonText}>Analyze Risk</Text>
                  </>
                )}
              </LinearGradient>
            </AnimatedTouchable>

            {riskData && (
              <GlassCard style={styles.resultCard}>
                <View style={styles.riskScoreContainer}>
                  <View style={[styles.riskScoreCircle, { borderColor: getRiskColor(riskData.risk_score) }]}>
                    <Text style={[styles.riskScoreValue, { color: getRiskColor(riskData.risk_score) }]}>{riskData.risk_score}</Text>
                    <Text style={[styles.riskScoreLabel, { color: colors.textSecondary }]}>Risk Score</Text>
                  </View>
                </View>

                <Text style={[styles.resultTitle, { color: colors.text }]}>Risk Factors</Text>
                {riskData.risk_factors?.map((factor: any, index: number) => (
                  <View key={index} style={[styles.factorCard, { backgroundColor: colors.bg }]}>
                    <View style={styles.factorHeader}>
                      <Text style={[styles.factorTitle, { color: colors.text }]}>{factor.factor}</Text>
                      <View style={[styles.impactBadge, { backgroundColor: factor.impact === 'high' ? Colors.error + '20' : factor.impact === 'medium' ? Colors.warning + '20' : Colors.success + '20' }]}>
                        <Text style={{ color: factor.impact === 'high' ? Colors.error : factor.impact === 'medium' ? Colors.warning : Colors.success, fontSize: 12, fontWeight: '600' }}>
                          {factor.impact}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.factorDescription, { color: colors.textSecondary }]}>{factor.description}</Text>
                    <View style={[styles.probabilityBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.probabilityFill, { width: `${factor.probability}%` }]} />
                    </View>
                    <Text style={[styles.probabilityText, { color: colors.textSecondary }]}>{factor.probability}% probability</Text>
                  </View>
                ))}

                <Text style={[styles.resultTitle, { color: colors.text }]}>AI Recommendations</Text>
                {riskData.recommendations?.map((rec: string, index: number) => (
                  <View key={index} style={[styles.recommendationCard, { backgroundColor: colors.bg }]}>
                    <MaterialIcons name="lightbulb" size={20} color={Colors.warning} />
                    <Text style={[styles.recommendationText, { color: colors.text }]}>{rec}</Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <View style={styles.section}>
            <AnimatedTouchable onPress={analyzeBudget} disabled={loading || !selectedProject}>
              <LinearGradient colors={[Colors.success, '#059669']} style={[styles.analyzeButton, (!selectedProject || loading) && styles.buttonDisabled]}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <MaterialIcons name="analytics" size={24} color="#FFF" />
                    <Text style={styles.analyzeButtonText}>Analyze Budget</Text>
                  </>
                )}
              </LinearGradient>
            </AnimatedTouchable>

            {budgetData && (
              <GlassCard style={styles.resultCard}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Budget Alerts</Text>
                {budgetData.alerts?.map((alert: any, index: number) => (
                  <View key={index} style={[styles.alertCard, { backgroundColor: colors.bg }]}>
                    <MaterialIcons name="warning" size={24} color={alert.severity === 'high' ? Colors.error : alert.severity === 'medium' ? Colors.warning : Colors.info} />
                    <View style={styles.alertContent}>
                      <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.category}</Text>
                      <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{alert.message}</Text>
                      <Text style={styles.alertAction}>Action: {alert.suggested_action}</Text>
                    </View>
                  </View>
                ))}

                {budgetData.cost_savings?.length > 0 && (
                  <>
                    <Text style={[styles.resultTitle, { color: colors.text }]}>Cost Savings</Text>
                    {budgetData.cost_savings.map((saving: any, index: number) => (
                      <View key={index} style={[styles.savingCard, { backgroundColor: colors.bg }]}>
                        <View style={styles.savingHeader}>
                          <MaterialIcons name="savings" size={24} color={Colors.success} />
                          <Text style={styles.savingAmount}>${saving.potential_savings.toLocaleString()}</Text>
                        </View>
                        <Text style={[styles.savingTitle, { color: colors.text }]}>{saving.opportunity}</Text>
                      </View>
                    ))}
                  </>
                )}

                <Text style={[styles.resultTitle, { color: colors.text }]}>Forecast</Text>
                <View style={[styles.forecastCard, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.forecastText, { color: colors.text }]}>{budgetData.forecast}</Text>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <View style={styles.section}>
            <AnimatedTouchable onPress={optimizeSchedule} disabled={loading || !selectedProject}>
              <LinearGradient colors={[Colors.info, Colors.secondary]} style={[styles.analyzeButton, (!selectedProject || loading) && styles.buttonDisabled]}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <MaterialIcons name="analytics" size={24} color="#FFF" />
                    <Text style={styles.analyzeButtonText}>Optimize Schedule</Text>
                  </>
                )}
              </LinearGradient>
            </AnimatedTouchable>

            {scheduleData && (
              <GlassCard style={styles.resultCard}>
                {scheduleData.critical_path?.length > 0 && (
                  <>
                    <Text style={[styles.resultTitle, { color: colors.text }]}>Critical Path</Text>
                    <View style={[styles.criticalPathCard, { backgroundColor: colors.bg }]}>
                      <MaterialIcons name="timeline" size={24} color={Colors.error} />
                      <Text style={[styles.criticalPathText, { color: colors.text }]}>
                        {scheduleData.critical_path.length} critical tasks identified
                      </Text>
                    </View>
                  </>
                )}

                {scheduleData.bottlenecks?.length > 0 && (
                  <>
                    <Text style={[styles.resultTitle, { color: colors.text }]}>Bottlenecks</Text>
                    {scheduleData.bottlenecks.map((bottleneck: any, index: number) => (
                      <View key={index} style={[styles.bottleneckCard, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.bottleneckIssue, { color: colors.text }]}>{bottleneck.issue}</Text>
                        <Text style={styles.bottleneckSolution}>Solution: {bottleneck.solution}</Text>
                      </View>
                    ))}
                  </>
                )}

                {scheduleData.weather_adjustments?.length > 0 && (
                  <>
                    <Text style={[styles.resultTitle, { color: colors.text }]}>Weather Adjustments</Text>
                    {scheduleData.weather_adjustments.map((adj: any, index: number) => (
                      <View key={index} style={[styles.weatherCard, { backgroundColor: colors.bg }]}>
                        <MaterialIcons name="wb-cloudy" size={24} color={Colors.info} />
                        <View style={styles.weatherContent}>
                          <Text style={[styles.weatherReason, { color: colors.text }]}>{adj.reason}</Text>
                          <Text style={styles.weatherDate}>Suggested: {adj.new_date}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </GlassCard>
            )}
          </View>
        )}

        {/* Info Card */}
        <GlassCard style={styles.infoCard}>
          <MaterialIcons name="auto-awesome" size={32} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>AI-Powered Intelligence</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Our AI analyzes project data, weather patterns, and industry trends to provide actionable insights.
            </Text>
          </View>
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.lg,
  },
  headerTitle: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  aiIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginBottom: Spacing.md },
  noProjects: { fontSize: Typography.sm, fontStyle: 'italic' },
  projectChip: { backgroundColor: Colors.dark.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: Colors.dark.border },
  projectChipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  projectChipText: { color: Colors.dark.textSecondary, fontSize: 14, fontWeight: '600' },
  projectChipTextActive: { color: '#FFF' },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4, marginTop: Spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 6 },
  tabActive: { backgroundColor: Colors.dark.bg },
  tabText: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '600' },
  analyzeButton: { borderRadius: 12, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: Spacing.lg },
  buttonDisabled: { opacity: 0.5 },
  analyzeButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  resultCard: { padding: Spacing.lg },
  riskScoreContainer: { alignItems: 'center', marginBottom: 20 },
  riskScoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  riskScoreValue: { fontSize: 36, fontWeight: 'bold' },
  riskScoreLabel: { fontSize: 12, marginTop: 4 },
  resultTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  factorCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  factorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  factorTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  impactBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  factorDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  probabilityBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  probabilityFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  probabilityText: { fontSize: 12 },
  recommendationCard: { flexDirection: 'row', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  recommendationText: { flex: 1, fontSize: 14, lineHeight: 20 },
  alertCard: { flexDirection: 'row', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  alertMessage: { fontSize: 14, marginBottom: 8 },
  alertAction: { fontSize: 14, color: Colors.warning },
  savingCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  savingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  savingAmount: { fontSize: 24, fontWeight: 'bold', color: Colors.success },
  savingTitle: { fontSize: 16 },
  forecastCard: { borderRadius: 12, padding: 16 },
  forecastText: { fontSize: 14, lineHeight: 22 },
  criticalPathCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, gap: 12 },
  criticalPathText: { fontSize: 16 },
  bottleneckCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  bottleneckIssue: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  bottleneckSolution: { fontSize: 14, color: Colors.success },
  weatherCard: { flexDirection: 'row', borderRadius: 12, padding: 16, marginBottom: 12, gap: 12 },
  weatherContent: { flex: 1 },
  weatherReason: { fontSize: 14, marginBottom: 4 },
  weatherDate: { fontSize: 12, color: Colors.info },
  infoCard: { flexDirection: 'row', padding: 20, marginTop: Spacing.lg, gap: 16 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
});
