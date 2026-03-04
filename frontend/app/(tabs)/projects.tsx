import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { format } from 'date-fns';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTouchable } from '../../components/AnimatedTouchable';

const { width } = Dimensions.get('window');

export default function ProjectsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: '',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    loadProjects();
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.budget) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await api.createProject({
        name: newProject.name,
        description: newProject.description,
        budget: parseFloat(newProject.budget),
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        status: 'planning',
        location: { lat: 30.2672, lng: -97.7431, address: 'Austin, TX' },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setNewProject({
        name: '',
        description: '',
        budget: '',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      loadProjects();
      Alert.alert('Success', 'Project created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'planning': return Colors.info;
      case 'on_hold': return Colors.warning;
      case 'completed': return Colors.completed;
      default: return Colors.dark.textSecondary;
    }
  };

  const getStatusGradient = (status: string): [string, string] => {
    switch (status) {
      case 'active': return [Colors.success, '#059669'];
      case 'planning': return [Colors.info, Colors.secondary];
      case 'on_hold': return [Colors.warning, '#D97706'];
      case 'completed': return [Colors.completed, '#7C3AED'];
      default: return [Colors.dark.card, Colors.dark.border];
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
      {/* Premium Header */}
      <LinearGradient
        colors={[Colors.secondary, Colors.secondaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerSubtitle}>{projects.length} Total Projects</Text>
        </View>
        <AnimatedTouchable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setModalVisible(true);
          }}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.addButtonGradient}
          >
            <MaterialIcons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </AnimatedTouchable>
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
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="folder-open" size={64} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>No projects yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + button to create your first project
            </Text>
          </View>
        ) : (
          projects.map((project, index) => (
            <AnimatedTouchable
              key={project.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <GlassCard style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <View style={styles.projectTitleRow}>
                    <LinearGradient
                      colors={getStatusGradient(project.status)}
                      style={styles.projectIcon}
                    >
                      <MaterialIcons name="construction" size={24} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.projectTitleContainer}>
                      <Text style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>
                        {project.name}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                          {project.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {project.description && (
                  <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {project.description}
                  </Text>
                )}

                <View style={styles.projectStats}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="attach-money" size={20} color={Colors.success} />
                    <View>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Budget</Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        ${(project.budget / 1000).toFixed(0)}K
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <MaterialIcons name="show-chart" size={20} color={Colors.info} />
                    <View>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Progress</Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {project.completion_percentage}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statItem}>
                    <MaterialIcons name="group" size={20} color={Colors.primary} />
                    <View>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Team</Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {project.team_members?.length || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${project.completion_percentage}%` }]}
                    />
                  </View>
                </View>

                <View style={styles.projectFooter}>
                  <View style={styles.dateInfo}>
                    <MaterialIcons name="calendar-today" size={14} color={colors.textSecondary} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                      {format(new Date(project.start_date), 'MMM dd')} - {format(new Date(project.end_date), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/gantt-chart?projectId=${project.id}`);
                    }}
                  >
                    <MaterialIcons name="timeline" size={18} color="#3B82F6" />
                    <Text style={styles.actionButtonText}>Gantt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/financials?projectId=${project.id}`);
                    }}
                  >
                    <MaterialIcons name="account-balance" size={18} color="#10B981" />
                    <Text style={styles.actionButtonText}>Financials</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/video-calls?projectId=${project.id}`);
                    }}
                  >
                    <MaterialIcons name="videocam" size={18} color="#8B5CF6" />
                    <Text style={styles.actionButtonText}>Video</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </AnimatedTouchable>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Project Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Project</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Project Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter project name"
                  placeholderTextColor={colors.textSecondary}
                  value={newProject.name}
                  onChangeText={(text) => setNewProject({ ...newProject, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter project description"
                  placeholderTextColor={colors.textSecondary}
                  value={newProject.description}
                  onChangeText={(text) => setNewProject({ ...newProject, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Budget (USD) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter budget amount"
                  placeholderTextColor={colors.textSecondary}
                  value={newProject.budget}
                  onChangeText={(text) => setNewProject({ ...newProject, budget: text })}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity onPress={handleCreateProject}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.createButton}
                >
                  <Text style={styles.createButtonText}>Create Project</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  addButton: { borderRadius: 16, overflow: 'hidden' },
  addButtonGradient: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  emptyText: { fontSize: Typography.xl, fontWeight: Typography.bold, marginTop: Spacing.base },
  emptySubtext: { fontSize: Typography.base, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: 40 },
  projectCard: { marginBottom: Spacing.base, padding: Spacing.lg },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  projectTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  projectIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  projectTitleContainer: { marginLeft: Spacing.md, flex: 1 },
  projectName: { fontSize: Typography.lg, fontWeight: Typography.bold },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.bold, textTransform: 'capitalize' },
  projectDescription: { fontSize: Typography.sm, marginBottom: Spacing.base, lineHeight: 20 },
  projectStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.base },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { fontSize: Typography.xs },
  statValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  progressContainer: { marginBottom: Spacing.md },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: Typography.sm },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: Typography.base, fontWeight: Typography.semibold, marginBottom: 8 },
  input: { borderRadius: 12, padding: 16, fontSize: Typography.base, borderWidth: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  createButton: { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  createButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: '#FFF' },
});
