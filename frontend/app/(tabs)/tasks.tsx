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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import api from '../../services/api';
import { Picker } from '@react-native-picker/picker';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTouchable } from '../../components/AnimatedTouchable';

export default function TasksScreen() {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '',
    status: 'pending',
    priority: 3,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        api.getTasks(),
        api.getProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id);
        setNewTask({ ...newTask, project_id: projectsData[0].id });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.project_id) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      await api.createTask(newTask);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setNewTask({ title: '', description: '', project_id: newTask.project_id, status: 'pending', priority: 3 });
      loadData();
      Alert.alert('Success', 'Task created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await api.updateTask(taskId, { status: newStatus });
      if (newStatus === 'completed') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      loadData();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'in_progress': return Colors.info;
      case 'blocked': return Colors.error;
      default: return Colors.warning;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return Colors.error;
    if (priority === 3) return Colors.warning;
    return Colors.success;
  };

  const filteredTasks = selectedProject ? tasks.filter((t) => t.project_id === selectedProject) : tasks;

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
        colors={[Colors.warning, '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>{filteredTasks.length} Tasks</Text>
        </View>
        <AnimatedTouchable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setModalVisible(true);
          }}
        >
          <View style={styles.addButtonInner}>
            <MaterialIcons name="add" size={28} color={Colors.warning} />
          </View>
        </AnimatedTouchable>
      </LinearGradient>

      {/* Project Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedProject && styles.filterChipActive]}
            onPress={() => setSelectedProject('')}
          >
            <Text style={[styles.filterChipText, !selectedProject && styles.filterChipTextActive]}>All Tasks</Text>
          </TouchableOpacity>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[styles.filterChip, selectedProject === project.id && styles.filterChipActive]}
              onPress={() => setSelectedProject(project.id)}
            >
              <Text style={[styles.filterChipText, selectedProject === project.id && styles.filterChipTextActive]}>
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="task" size={64} color={Colors.warning} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>No tasks yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap the + button to create your first task</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <AnimatedTouchable
              key={task.id}
              onPress={() => {
                const statuses = ['pending', 'in_progress', 'completed', 'blocked'];
                const currentIndex = statuses.indexOf(task.status);
                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                updateTaskStatus(task.id, nextStatus);
              }}
            >
              <GlassCard style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleRow}>
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                    <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                      {task.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {task.description && (
                  <Text style={[styles.taskDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                <View style={styles.taskFooter}>
                  <View style={styles.taskMeta}>
                    <MaterialIcons name="flag" size={16} color={getPriorityColor(task.priority)} />
                    <Text style={[styles.taskMetaText, { color: colors.textSecondary }]}>P{task.priority}</Text>
                  </View>
                  <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to change status</Text>
                </View>
              </GlassCard>
            </AnimatedTouchable>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Task Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Task</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Task Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter task title"
                  placeholderTextColor={colors.textSecondary}
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter task description"
                  placeholderTextColor={colors.textSecondary}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Project *</Text>
                <View style={[styles.pickerContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Picker
                    selectedValue={newTask.project_id}
                    onValueChange={(value) => setNewTask({ ...newTask, project_id: value })}
                    style={{ color: colors.text }}
                  >
                    {projects.map((project) => (
                      <Picker.Item key={project.id} label={project.name} value={project.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Priority (1-5)</Text>
                <View style={[styles.pickerContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Picker
                    selectedValue={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    style={{ color: colors.text }}
                  >
                    <Picker.Item label="1 - Low" value={1} />
                    <Picker.Item label="2" value={2} />
                    <Picker.Item label="3 - Medium" value={3} />
                    <Picker.Item label="4" value={4} />
                    <Picker.Item label="5 - Critical" value={5} />
                  </Picker>
                </View>
              </View>

              <TouchableOpacity onPress={handleCreateTask}>
                <LinearGradient colors={[Colors.warning, '#D97706']} style={styles.createButton}>
                  <Text style={styles.createButtonText}>Create Task</Text>
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
  addButtonInner: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16 },
  filterSection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.base },
  filterChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterChipActive: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  filterChipText: { color: Colors.dark.textSecondary, fontSize: 14, fontWeight: '600' },
  filterChipTextActive: { color: '#FFF' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.warning + '20',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  emptyText: { fontSize: Typography.xl, fontWeight: Typography.bold, marginTop: Spacing.base },
  emptySubtext: { fontSize: Typography.base, marginTop: Spacing.sm, textAlign: 'center' },
  taskCard: { marginBottom: Spacing.md, padding: Spacing.base },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  priorityIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  taskTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  taskDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20, marginLeft: 16 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 16 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskMetaText: { fontSize: 12 },
  tapHint: { fontSize: 11, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  createButton: { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  createButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
});
