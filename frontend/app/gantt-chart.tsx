import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

const { width } = Dimensions.get('window');
const DAY_WIDTH = 40;

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  status: string;
  priority: number;
}

export default function GanttChartScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const [ganttData, setGanttData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'days' | 'weeks'>('weeks');

  useEffect(() => {
    loadGanttData();
  }, [projectId]);

  const loadGanttData = async () => {
    try {
      const data = await api.api.get(`/gantt/${projectId}`);
      setGanttData(data.data);
    } catch (error) {
      console.error('Failed to load Gantt data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPositionFromStart = (projectStart: string, taskStart: string) => {
    const days = getDaysBetween(projectStart, taskStart);
    return days * (viewMode === 'days' ? DAY_WIDTH : DAY_WIDTH / 7);
  };

  const getTaskWidth = (taskStart: string, taskEnd: string) => {
    const days = getDaysBetween(taskStart, taskEnd);
    return Math.max(days * (viewMode === 'days' ? DAY_WIDTH : DAY_WIDTH / 7), 20);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'blocked': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!ganttData) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <Text style={styles.errorText}>Failed to load Gantt chart</Text>
      </View>
    );
  }

  const projectDays = getDaysBetween(ganttData.project_start, ganttData.project_end);
  const timelineWidth = projectDays * (viewMode === 'days' ? DAY_WIDTH : DAY_WIDTH / 7);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gantt Chart</Text>
          <Text style={styles.headerSubtitle}>{ganttData.project_name}</Text>
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => setViewMode('days')}
            style={[styles.toggleButton, viewMode === 'days' && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'days' && styles.toggleTextActive]}>Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('weeks')}
            style={[styles.toggleButton, viewMode === 'weeks' && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'weeks' && styles.toggleTextActive]}>Weeks</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Blocked</Text>
        </View>
      </View>

      {/* Gantt Chart */}
      <ScrollView style={styles.scrollView}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={styles.ganttContainer}>
            {/* Timeline Header */}
            <View style={[styles.timeline, { width: timelineWidth }]}>
              {Array.from({ length: Math.ceil(projectDays / (viewMode === 'days' ? 1 : 7)) }).map((_, i) => (
                <View key={i} style={styles.timelineSegment}>
                  <Text style={styles.timelineText}>
                    {viewMode === 'days' ? `Day ${i + 1}` : `Week ${i + 1}`}
                  </Text>
                </View>
              ))}
            </View>

            {/* Tasks */}
            {ganttData.tasks.map((task: GanttTask, index: number) => {
              const taskStart = getPositionFromStart(ganttData.project_start, task.start);
              const taskWidth = getTaskWidth(task.start, task.end);
              const statusColor = getStatusColor(task.status);

              return (
                <View key={task.id} style={styles.taskRow}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName} numberOfLines={1}>{task.name}</Text>
                    <Text style={styles.taskDates}>
                      {new Date(task.start).toLocaleDateString()} - {new Date(task.end).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.taskTimeline, { width: timelineWidth }]}>
                    <View
                      style={[
                        styles.taskBar,
                        {
                          left: taskStart,
                          width: taskWidth,
                          backgroundColor: statusColor,
                        },
                      ]}
                    >
                      <View style={[styles.taskProgress, { width: `${task.progress}%` }]} />
                      <Text style={styles.taskProgressText} numberOfLines={1}>
                        {task.progress}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: { padding: 8, marginRight: 12 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  viewToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 2 },
  toggleButton: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  toggleButtonActive: { backgroundColor: '#FF6B35' },
  toggleText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  toggleTextActive: { color: '#FFF' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  scrollView: { flex: 1 },
  ganttContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  timeline: {
    flexDirection: 'row',
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  timelineSegment: {
    width: DAY_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  timelineText: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 50,
  },
  taskInfo: {
    width: 150,
    paddingRight: 12,
  },
  taskName: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  taskDates: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  taskTimeline: {
    position: 'relative',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  taskBar: {
    position: 'absolute',
    height: 32,
    top: 4,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  taskProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  taskProgressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  errorText: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
});