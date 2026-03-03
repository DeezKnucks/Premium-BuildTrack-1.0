import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import api from '../services/api';
import { format } from 'date-fns';

export default function ChatScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      const interval = setInterval(() => loadMessages(selectedRoom.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const data = await api.getChatRooms();
      setRooms(data);
      if (data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const data = await api.getMessages(roomId);
      setMessages(data);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);
    
    try {
      await api.sendMessage(selectedRoom.id, newMessage.trim());
      setNewMessage('');
      loadMessages(selectedRoom.id);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const createRoom = async () => {
    const roomName = `Team Chat ${rooms.length + 1}`;
    try {
      await api.createChatRoom({ name: roomName });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadRooms();
    } catch (error) {
      Alert.alert('Error', 'Failed to create room');
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
      {/* Header */}
      <LinearGradient
        colors={[Colors.info, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Team Chat</Text>
          <Text style={styles.headerSubtitle}>
            {selectedRoom ? selectedRoom.name : 'Select a conversation'}
          </Text>
        </View>
        <TouchableOpacity onPress={createRoom} style={styles.newChatButton}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.mainContent}>
        {/* Room List */}
        <View style={[styles.roomList, { backgroundColor: colors.card }]}>
          <Text style={[styles.roomListTitle, { color: colors.textSecondary }]}>CONVERSATIONS</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {rooms.length === 0 ? (
              <TouchableOpacity onPress={createRoom} style={styles.createRoomPrompt}>
                <MaterialIcons name="add-circle" size={32} color={Colors.primary} />
                <Text style={[styles.createRoomText, { color: colors.textSecondary }]}>Create first chat</Text>
              </TouchableOpacity>
            ) : (
              rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomItem,
                    selectedRoom?.id === room.id && { backgroundColor: Colors.primary + '20' }
                  ]}
                  onPress={() => setSelectedRoom(room)}
                >
                  <View style={[styles.roomAvatar, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.roomInitial}>{room.name?.charAt(0) || 'T'}</Text>
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
                      {room.name || 'Team Chat'}
                    </Text>
                    <Text style={[styles.roomPreview, { color: colors.textSecondary }]} numberOfLines={1}>
                      {room.members?.length || 1} members
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Chat Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatArea}
          keyboardVerticalOffset={100}
        >
          {selectedRoom ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.length === 0 ? (
                  <View style={styles.emptyMessages}>
                    <MaterialIcons name="chat-bubble-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages yet</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Start the conversation!</Text>
                  </View>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <View
                        key={msg.id || index}
                        style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}
                      >
                        {!isOwn && (
                          <Text style={styles.senderName}>{msg.sender_name}</Text>
                        )}
                        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
                          {msg.content}
                        </Text>
                        <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
                          {msg.sent_at ? format(new Date(msg.sent_at), 'HH:mm') : ''}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {/* Message Input */}
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.messageInput, { color: colors.text }]}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.textSecondary}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.sendButtonGradient}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <MaterialIcons name="send" size={20} color="#FFF" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.noChatSelected}>
              <MaterialIcons name="forum" size={64} color={colors.textSecondary} />
              <Text style={[styles.noChatText, { color: colors.textSecondary }]}>Select a conversation</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    ...Shadows.lg,
  },
  backButton: { marginRight: Spacing.md },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  newChatButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  mainContent: { flex: 1, flexDirection: 'row' },
  roomList: { width: 100, borderRightWidth: 1, borderRightColor: 'rgba(100,100,100,0.2)' },
  roomListTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, padding: Spacing.sm, textAlign: 'center' },
  createRoomPrompt: { alignItems: 'center', padding: Spacing.lg },
  createRoomText: { fontSize: 11, marginTop: Spacing.sm, textAlign: 'center' },
  roomItem: { flexDirection: 'column', alignItems: 'center', padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(100,100,100,0.1)' },
  roomAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  roomInitial: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  roomInfo: { marginTop: 4, alignItems: 'center' },
  roomName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  roomPreview: { fontSize: 9, marginTop: 2 },
  chatArea: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  emptyMessages: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.bold, marginTop: Spacing.md },
  emptySubtext: { fontSize: Typography.sm, marginTop: Spacing.sm },
  messageBubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: 16, marginBottom: Spacing.sm },
  ownMessage: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: Colors.dark.card, borderBottomLeftRadius: 4 },
  senderName: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  messageText: { fontSize: 15, color: Colors.dark.text, lineHeight: 20 },
  ownMessageText: { color: '#FFF' },
  messageTime: { fontSize: 10, color: Colors.dark.textSecondary, marginTop: 4, alignSelf: 'flex-end' },
  ownMessageTime: { color: 'rgba(255,255,255,0.7)' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, borderTopWidth: 1 },
  messageInput: { flex: 1, maxHeight: 100, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: 16 },
  sendButton: { marginLeft: Spacing.sm },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  noChatSelected: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noChatText: { fontSize: Typography.lg, marginTop: Spacing.md },
});
