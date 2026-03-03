import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useVoiceCommands, VOICE_COMMANDS, VoiceCommand } from '../services/VoiceCommandService';

export default function VoiceCommandsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [testCommand, setTestCommand] = useState('');

  const {
    isSpeaking,
    isProcessing,
    lastCommand,
    speak,
    processText,
    speakAvailableCommands,
    commands,
  } = useVoiceCommands((command, transcript) => {
    // Handle voice commands
    switch (command.action) {
      case 'NAVIGATE_DASHBOARD':
        router.push('/(tabs)/dashboard');
        break;
      case 'NAVIGATE_PROJECTS':
        router.push('/(tabs)/projects');
        break;
      case 'NAVIGATE_TASKS':
        router.push('/(tabs)/tasks');
        break;
      case 'NAVIGATE_SAFETY':
        router.push('/safety-monitor');
        break;
      case 'LIST_COMMANDS':
        speakAvailableCommands();
        break;
      case 'CREATE_PROJECT':
        router.push('/project-wizard');
        break;
      default:
        speak(`Command ${command.description} received`);
    }
  });

  const handleTestCommand = async () => {
    if (!testCommand.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await processText(testCommand);
    setTestCommand('');
  };

  const handleSpeakDemo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak('Welcome to BuildTrack voice commands. You can navigate, create projects, and trigger safety alerts using your voice.');
  };

  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, VoiceCommand[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return 'navigation';
      case 'safety': return 'shield';
      case 'project': return 'folder';
      case 'task': return 'check-circle';
      case 'general': return 'settings';
      default: return 'mic';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return Colors.primary;
      case 'safety': return '#EF4444';
      case 'project': return Colors.secondary;
      case 'task': return Colors.success;
      case 'general': return Colors.warning;
      default: return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Voice Commands</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Card */}
        <GlassCard style={styles.demoCard}>
          <MaterialIcons name="record-voice-over" size={48} color={Colors.primary} />
          <Text style={[styles.demoTitle, { color: colors.text }]}>Hands-Free Operation</Text>
          <Text style={[styles.demoText, { color: colors.textSecondary }]}>
            Use voice commands for navigation, safety alerts, and project management while keeping your hands free on the job site.
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleSpeakDemo}
            disabled={isSpeaking}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.demoButtonGradient}
            >
              <MaterialIcons name={isSpeaking ? 'volume-up' : 'play-arrow'} size={20} color="#FFF" />
              <Text style={styles.demoButtonText}>
                {isSpeaking ? 'Speaking...' : 'Hear Demo'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        {/* Test Command Input */}
        <View style={styles.testSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Test a Command</Text>
          <View style={styles.testInputContainer}>
            <TextInput
              style={[styles.testInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Type a command to test..."
              placeholderTextColor={colors.textSecondary}
              value={testCommand}
              onChangeText={setTestCommand}
              onSubmitEditing={handleTestCommand}
            />
            <TouchableOpacity
              style={[styles.testButton, isProcessing && styles.testButtonDisabled]}
              onPress={handleTestCommand}
              disabled={isProcessing}
            >
              <MaterialIcons name="send" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          {lastCommand && (
            <View style={styles.lastCommandContainer}>
              <Text style={[styles.lastCommandLabel, { color: colors.textSecondary }]}>
                Last command:
              </Text>
              <Text style={[styles.lastCommandText, { color: Colors.success }]}>
                {lastCommand.description}
              </Text>
            </View>
          )}
        </View>

        {/* Available Commands */}
        <View style={styles.commandsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Commands</Text>
          
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <MaterialIcons
                  name={getCategoryIcon(category) as any}
                  size={20}
                  color={getCategoryColor(category)}
                />
                <Text style={[styles.categoryTitle, { color: colors.text }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
              
              {cmds.map((cmd) => (
                <TouchableOpacity
                  key={cmd.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTestCommand(cmd.phrases[0]);
                  }}
                >
                  <GlassCard style={styles.commandCard}>
                    <View style={styles.commandInfo}>
                      <Text style={[styles.commandPhrase, { color: colors.text }]}>
                        "{cmd.phrases[0]}"
                      </Text>
                      <Text style={[styles.commandDescription, { color: colors.textSecondary }]}>
                        {cmd.description}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.xl, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  demoCard: { alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.xl },
  demoTitle: { fontSize: Typography.xl, fontWeight: '700', marginTop: Spacing.md },
  demoText: { fontSize: Typography.base, textAlign: 'center', marginTop: Spacing.sm },
  demoButton: { marginTop: Spacing.lg },
  demoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  demoButtonText: { color: '#FFF', fontSize: Typography.base, fontWeight: '600' },
  testSection: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.lg, fontWeight: '700', marginBottom: Spacing.md },
  testInputContainer: { flexDirection: 'row', gap: Spacing.sm },
  testInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    fontSize: Typography.base,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  testButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testButtonDisabled: { opacity: 0.5 },
  lastCommandContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  lastCommandLabel: { fontSize: Typography.sm },
  lastCommandText: { fontSize: Typography.sm, fontWeight: '600' },
  commandsSection: { marginBottom: Spacing.xl },
  categorySection: { marginBottom: Spacing.lg },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  categoryTitle: { fontSize: Typography.base, fontWeight: '600', textTransform: 'capitalize' },
  commandCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs, padding: Spacing.md },
  commandInfo: { flex: 1 },
  commandPhrase: { fontSize: Typography.sm, fontWeight: '600', fontStyle: 'italic' },
  commandDescription: { fontSize: Typography.xs, marginTop: 2 },
});
