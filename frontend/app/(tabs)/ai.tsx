import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AIScreen() {
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
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const analyzeRisk = async () => {
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project first');
      return;
    }

    setLoading(true);
    try {
      const data = await api.predictRisks(selectedProject);
      setRiskData(data);
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

    setLoading(true);
    try {
      const data = await api.analyzeBudget(selectedProject);
      setBudgetData(data);
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

    setLoading(true);
    try {
      const data = await api.optimizeSchedule(selectedProject);
      setScheduleData(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to optimize schedule');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#F44336';
    if (score >= 40) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AI Insights</Text>
          <Text style={styles.headerSubtitle}>Powered by GPT-5.2</Text>
        </View>
        <MaterialIcons name="psychology" size={48} color="#FF6B35" />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Active Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectChip,
                  selectedProject === project.id && styles.projectChipActive,
                ]}
                onPress={() => {
                  setSelectedProject(project.id);
                  setRiskData(null);
                  setBudgetData(null);
                  setScheduleData(null);
                }}
              >
                <Text
                  style={[
                    styles.projectChipText,
                    selectedProject === project.id && styles.projectChipTextActive,
                  ]}
                >
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'risk' && styles.tabActive]}
            onPress={() => setActiveTab('risk')}
          >
            <MaterialIcons
              name="warning"
              size={20}
              color={activeTab === 'risk' ? '#FF6B35' : '#666'}
            />
            <Text
              style={[styles.tabText, activeTab === 'risk' && styles.tabTextActive]}
            >
              Risk Engine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'budget' && styles.tabActive]}
            onPress={() => setActiveTab('budget')}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={20}
              color={activeTab === 'budget' ? '#FF6B35' : '#666'}
            />
            <Text
              style={[styles.tabText, activeTab === 'budget' && styles.tabTextActive]}
            >
              Budget Guardian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'schedule' && styles.tabActive]}
            onPress={() => setActiveTab('schedule')}
          >
            <MaterialIcons
              name="schedule"
              size={20}
              color={activeTab === 'schedule' ? '#FF6B35' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'schedule' && styles.tabTextActive,
              ]}
            >
              Scheduler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Risk Engine Tab */}
        {activeTab === 'risk' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.analyzeButton, loading && styles.buttonDisabled]}
              onPress={analyzeRisk}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="analytics" size={24} color="#FFF" />
                  <Text style={styles.analyzeButtonText}>Analyze Risk</Text>
                </>
              )}
            </TouchableOpacity>

            {riskData && (
              <View style={styles.resultCard}>
                <View style={styles.riskScore}>
                  <View
                    style={[
                      styles.riskScoreCircle,
                      { borderColor: getRiskColor(riskData.risk_score) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskScoreValue,
                        { color: getRiskColor(riskData.risk_score) },
                      ]}
                    >
                      {riskData.risk_score}
                    </Text>
                    <Text style={styles.riskScoreLabel}>Risk Score</Text>
                  </View>
                </View>

                <Text style={styles.resultTitle}>Risk Factors</Text>
                {riskData.risk_factors?.map((factor: any, index: number) => (
                  <View key={index} style={styles.factorCard}>
                    <View style={styles.factorHeader}>
                      <Text style={styles.factorTitle}>{factor.factor}</Text>
                      <View
                        style={[
                          styles.impactBadge,
                          {
                            backgroundColor:
                              factor.impact === 'high'
                                ? '#F4433620'
                                : factor.impact === 'medium'
                                ? '#FF980020'
                                : '#4CAF5020',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.impactText,
                            {
                              color:
                                factor.impact === 'high'
                                  ? '#F44336'
                                  : factor.impact === 'medium'
                                  ? '#FF9800'
                                  : '#4CAF50',
                            },
                          ]}
                        >
                          {factor.impact}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.factorDescription}>{factor.description}</Text>
                    <View style={styles.probabilityBar}>
                      <View
                        style={[
                          styles.probabilityFill,
                          { width: `${factor.probability}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.probabilityText}>
                      {factor.probability}% probability
                    </Text>
                  </View>
                ))}

                <Text style={styles.resultTitle}>AI Recommendations</Text>
                {riskData.recommendations?.map((rec: string, index: number) => (
                  <View key={index} style={styles.recommendationCard}>
                    <MaterialIcons name="lightbulb" size={20} color="#FF9800" />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Budget Guardian Tab */}
        {activeTab === 'budget' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.analyzeButton, loading && styles.buttonDisabled]}
              onPress={analyzeBudget}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="analytics" size={24} color="#FFF" />
                  <Text style={styles.analyzeButtonText}>Analyze Budget</Text>
                </>
              )}
            </TouchableOpacity>

            {budgetData && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Budget Alerts</Text>
                {budgetData.alerts?.map((alert: any, index: number) => (
                  <View key={index} style={styles.alertCard}>
                    <MaterialIcons
                      name="warning"
                      size={24}
                      color={
                        alert.severity === 'high'
                          ? '#F44336'
                          : alert.severity === 'medium'
                          ? '#FF9800'
                          : '#2196F3'
                      }
                    />
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{alert.category}</Text>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      <Text style={styles.alertAction}>
                        Action: {alert.suggested_action}
                      </Text>
                    </View>
                  </View>
                ))}

                {budgetData.cost_savings && budgetData.cost_savings.length > 0 && (
                  <>
                    <Text style={styles.resultTitle}>Cost Saving Opportunities</Text>
                    {budgetData.cost_savings.map((saving: any, index: number) => (
                      <View key={index} style={styles.savingCard}>
                        <View style={styles.savingHeader}>
                          <MaterialIcons name="savings" size={24} color="#4CAF50" />
                          <Text style={styles.savingAmount}>
                            ${saving.potential_savings.toLocaleString()}
                          </Text>
                        </View>
                        <Text style={styles.savingTitle}>{saving.opportunity}</Text>
                        <View style={styles.effortBadge}>
                          <Text style={styles.effortText}>
                            Effort: {saving.effort}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                <Text style={styles.resultTitle}>Forecast</Text>
                <View style={styles.forecastCard}>
                  <Text style={styles.forecastText}>{budgetData.forecast}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Schedule Optimizer Tab */}
        {activeTab === 'schedule' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.analyzeButton, loading && styles.buttonDisabled]}
              onPress={optimizeSchedule}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="analytics" size={24} color="#FFF" />
                  <Text style={styles.analyzeButtonText}>Optimize Schedule</Text>
                </>
              )}
            </TouchableOpacity>

            {scheduleData && (
              <View style={styles.resultCard}>
                {scheduleData.critical_path && scheduleData.critical_path.length > 0 && (
                  <>
                    <Text style={styles.resultTitle}>Critical Path</Text>
                    <View style={styles.criticalPathCard}>
                      <Text style={styles.criticalPathText}>
                        {scheduleData.critical_path.length} critical tasks identified
                      </Text>
                    </View>
                  </>
                )}

                {scheduleData.bottlenecks && scheduleData.bottlenecks.length > 0 && (
                  <>
                    <Text style={styles.resultTitle}>Bottlenecks</Text>
                    {scheduleData.bottlenecks.map((bottleneck: any, index: number) => (
                      <View key={index} style={styles.bottleneckCard}>
                        <Text style={styles.bottleneckIssue}>{bottleneck.issue}</Text>
                        <Text style={styles.bottleneckSolution}>
                          Solution: {bottleneck.solution}
                        </Text>
                      </View>
                    ))}
                  </>
                )}

                {scheduleData.weather_adjustments &&
                  scheduleData.weather_adjustments.length > 0 && (
                    <>
                      <Text style={styles.resultTitle}>Weather Adjustments</Text>
                      {scheduleData.weather_adjustments.map(
                        (adjustment: any, index: number) => (
                          <View key={index} style={styles.weatherCard}>
                            <MaterialIcons name="wb-cloudy" size={24} color="#2196F3" />
                            <View style={styles.weatherContent}>
                              <Text style={styles.weatherReason}>{adjustment.reason}</Text>
                              <Text style={styles.weatherDate}>
                                Suggested: {adjustment.new_date}
                              </Text>
                            </View>
                          </View>
                        )
                      )}
                    </>
                  )}
              </View>
            )}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <MaterialIcons name="auto-awesome" size={32} color="#FF6B35" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>AI-Powered Intelligence</Text>
              <Text style={styles.infoText}>
                Our AI analyzes project data, weather patterns, historical performance, and
                industry trends to provide actionable insights that help you stay ahead of
                risks and optimize project success.
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  projectChip: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  projectChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  projectChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  projectChipTextActive: {
    color: '#FFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#2A2A3E',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF6B35',
  },
  analyzeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  resultCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 12,
  },
  riskScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  riskScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  factorCard: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  factorDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    lineHeight: 20,
  },
  probabilityBar: {
    height: 6,
    backgroundColor: '#2A2A3E',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
  },
  probabilityText: {
    fontSize: 12,
    color: '#999',
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
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
    marginBottom: 8,
  },
  alertAction: {
    fontSize: 14,
    color: '#FF9800',
  },
  savingCard: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  savingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  savingTitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
  },
  effortBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  effortText: {
    fontSize: 12,
    color: '#999',
  },
  forecastCard: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
  },
  forecastText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 22,
  },
  criticalPathCard: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  criticalPathText: {
    fontSize: 16,
    color: '#FFF',
  },
  bottleneckCard: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bottleneckIssue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  bottleneckSolution: {
    fontSize: 14,
    color: '#4CAF50',
  },
  weatherCard: {
    flexDirection: 'row',
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  weatherContent: {
    flex: 1,
  },
  weatherReason: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  weatherDate: {
    fontSize: 12,
    color: '#2196F3',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});