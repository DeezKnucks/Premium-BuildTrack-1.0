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
import api from '../../services/api';
import { Picker } from '@react-native-picker/picker';

export default function TasksScreen() {
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
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
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
      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        project_id: newTask.project_id,
        status: 'pending',
        priority: 3,
      });
      loadData();
      Alert.alert('Success', 'Task created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'blocked':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return '#F44336';
    if (priority === 3) return '#FF9800';
    return '#4CAF50';
  };

  const filteredTasks = selectedProject
    ? tasks.filter((t) => t.project_id === selectedProject)
    : tasks;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add-circle" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Project Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Project:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedProject && styles.filterChipActive,
            ]}
            onPress={() => setSelectedProject('')}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedProject && styles.filterChipTextActive,
              ]}
            >
              All Tasks
            </Text>
          </TouchableOpacity>
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.filterChip,
                selectedProject === project.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedProject(project.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedProject === project.id && styles.filterChipTextActive,
                ]}
              >
                {project.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="task" size={64} color="#666" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first task
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleRow}>
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: getPriorityColor(task.priority) },
                    ]}
                  />
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(task.status) + '20' },
                  ]}
                  onPress={() => {
                    const statuses = ['pending', 'in_progress', 'completed', 'blocked'];
                    const currentIndex = statuses.indexOf(task.status);
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                    updateTaskStatus(task.id, nextStatus);
                  }}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(task.status) },
                    ]}
                  >
                    {task.status.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              </View>

              {task.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}

              <View style={styles.taskFooter}>
                <View style={styles.taskMeta}>
                  <MaterialIcons name="flag" size={16} color={getPriorityColor(task.priority)} />
                  <Text style={styles.taskMetaText}>Priority {task.priority}</Text>
                </View>
                {task.assigned_to && task.assigned_to.length > 0 && (
                  <View style={styles.taskMeta}>
                    <MaterialIcons name="person" size={16} color="#999" />
                    <Text style={styles.taskMetaText}>
                      {task.assigned_to.length} assigned
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter task title"
                  placeholderTextColor="#666"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter task description"
                  placeholderTextColor="#666"
                  value={newTask.description}
                  onChangeText={(text) =>
                    setNewTask({ ...newTask, description: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Project *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTask.project_id}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, project_id: value })
                    }
                    style={styles.picker}
                  >
                    {projects.map((project) => (
                      <Picker.Item
                        key={project.id}
                        label={project.name}
                        value={project.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priority (1-5)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="1 - Low" value={1} />
                    <Picker.Item label="2" value={2} />
                    <Picker.Item label="3 - Medium" value={3} />
                    <Picker.Item label="4" value={4} />
                    <Picker.Item label="5 - Critical" value={5} />
                  </Picker>
                </View>
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTask}
              >
                <Text style={styles.createButtonText}>Create Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskMetaText: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFF',
    height: 56,
  },
  createButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});