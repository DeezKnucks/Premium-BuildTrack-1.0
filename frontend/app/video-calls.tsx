import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VideoCallsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const [calls, setCalls] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [callType, setCallType] = useState<'one_on_one' | 'group'>('one_on_one');
  const [userRole, setUserRole] = useState('crew');
  const [newCall, setNewCall] = useState({
    title: '',
    call_type: 'one_on_one',
    participants: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || 'crew');
      }

      const callsData = await api.api.get('/video-calls', {
        params: projectId ? { project_id: projectId } : {},
      });
      setCalls(callsData.data);

      if (projectId) {
        const membersData = await api.api.get(`/team-members/${projectId}`);
        setTeamMembers(membersData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateGroupCall = () => {
    return ['admin', 'supervisor', 'pm'].includes(userRole);
  };

  const handleCreateCall = async () => {
    if (!newCall.title || newCall.participants.length === 0) {
      Alert.alert('Error', 'Please enter a title and select participants');
      return;
    }

    if (newCall.call_type === 'group' && !canCreateGroupCall()) {
      Alert.alert('Permission Denied', 'Only admins, supervisors, and project managers can create group calls');
      return;
    }

    try {
      await api.api.post('/video-calls', {
        ...newCall,
        project_id: projectId,
        scheduled_time: new Date().toISOString(),
      });
      Alert.alert('Success', 'Video call created successfully!');
      setModalVisible(false);
      setNewCall({ title: '', call_type: 'one_on_one', participants: [], notes: '' });
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create call');
    }
  };

  const handleJoinCall = async (call: any) => {
    try {
      await api.api.put(`/video-calls/${call.id}/start`);
      // Open meeting link
      await Linking.openURL(call.meeting_link);
    } catch (error) {
      Alert.alert('Error', 'Failed to join call');
    }
  };

  const handleEndCall = async (callId: string) => {
    try {
      await api.api.put(`/video-calls/${callId}/end`);
      Alert.alert('Success', 'Call ended');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to end call');
    }
  };

  const toggleParticipant = (userId: string) => {
    setNewCall(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId],
    }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Video Calls</Text>
          <Text style={styles.headerSubtitle}>Team Communication</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Permission Info */}
      <View style={styles.infoCard}>
        <MaterialIcons name="info" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          {canCreateGroupCall()
            ? 'You can create group calls and 1-on-1 calls'
            : 'You can create 1-on-1 calls with team members'}
        </Text>
      </View>

      {/* Calls List */}
      <ScrollView style={styles.content}>
        {calls.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="videocam-off" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>No video calls scheduled</Text>
            <Text style={styles.emptySubtext}>Create a call to get started</Text>
          </View>
        ) : (
          calls.map((call) => (
            <View key={call.id} style={styles.callCard}>
              <View style={styles.callHeader}>
                <View style={styles.callIconContainer}>
                  <MaterialIcons
                    name={call.call_type === 'one_on_one' ? 'person' : 'group'}
                    size={24}
                    color="#FF6B35"
                  />
                </View>
                <View style={styles.callInfo}>
                  <Text style={styles.callTitle}>{call.title}</Text>
                  <Text style={styles.callMeta}>
                    {call.call_type === 'one_on_one' ? '1-on-1' : 'Group'} • {call.participants.length} participants
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(call.status) }]}>
                  <Text style={styles.statusText}>{call.status.toUpperCase()}</Text>
                </View>
              </View>

              {call.notes && (
                <Text style={styles.callNotes}>{call.notes}</Text>
              )}

              <View style={styles.callActions}>
                {call.status === 'scheduled' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.joinButton]}
                    onPress={() => handleJoinCall(call)}
                  >
                    <MaterialIcons name="videocam" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Join Call</Text>
                  </TouchableOpacity>
                )}
                {call.status === 'active' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.joinButton]}
                      onPress={() => handleJoinCall(call)}
                    >
                      <MaterialIcons name="videocam" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Rejoin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.endButton]}
                      onPress={() => handleEndCall(call.id)}
                    >
                      <MaterialIcons name="call-end" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>End</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Call Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Video Call</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Call Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Call Type</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[styles.typeButton, newCall.call_type === 'one_on_one' && styles.typeButtonActive]}
                    onPress={() => setNewCall({ ...newCall, call_type: 'one_on_one' })}
                  >
                    <MaterialIcons name="person" size={20} color="#FFF" />
                    <Text style={styles.typeButtonText}>1-on-1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newCall.call_type === 'group' && styles.typeButtonActive,
                      !canCreateGroupCall() && styles.typeButtonDisabled,
                    ]}
                    onPress={() => canCreateGroupCall() && setNewCall({ ...newCall, call_type: 'group' })}
                    disabled={!canCreateGroupCall()}
                  >
                    <MaterialIcons name="group" size={20} color={canCreateGroupCall() ? '#FFF' : '#666'} />
                    <Text style={[styles.typeButtonText, !canCreateGroupCall() && { color: '#666' }]}>Group</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={newCall.title}
                  onChangeText={(text) => setNewCall({ ...newCall, title: text })}
                  placeholder="e.g., Daily Standup"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>

              {/* Participants */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Participants ({newCall.participants.length})</Text>
                {teamMembers.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberItem}
                    onPress={() => toggleParticipant(member.id)}
                  >
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitials}>
                          {member.full_name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.memberName}>{member.full_name}</Text>
                        <Text style={styles.memberRole}>{member.role}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        newCall.participants.includes(member.id) && styles.checkboxActive,
                      ]}
                    >
                      {newCall.participants.includes(member.id) && (
                        <MaterialIcons name="check" size={16} color="#FFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newCall.notes}
                  onChangeText={(text) => setNewCall({ ...newCall, notes: text })}
                  placeholder="Add any notes..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.createButton} onPress={handleCreateCall}>
                <Text style={styles.createButtonText}>Create Call</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#10B981';
    case 'scheduled': return '#3B82F6';
    case 'ended': return '#6B7280';
    default: return '#EF4444';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  backButton: { padding: 8, marginRight: 12 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  addButton: { padding: 8 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.1)',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#FFF', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  callCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  callHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  callIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,53,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callInfo: { flex: 1, marginLeft: 12 },
  callTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  callMeta: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  callNotes: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12, fontStyle: 'italic' },
  callActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  joinButton: { backgroundColor: '#10B981' },
  endButton: { backgroundColor: '#EF4444' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: { borderColor: '#FF6B35', backgroundColor: 'rgba(255,107,53,0.2)' },
  typeButtonDisabled: { opacity: 0.4 },
  typeButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitials: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  memberName: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  memberRole: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  createButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});