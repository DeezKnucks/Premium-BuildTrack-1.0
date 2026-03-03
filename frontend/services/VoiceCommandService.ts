import { useState, useEffect, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

// Voice command types
export interface VoiceCommand {
  id: string;
  phrases: string[];
  action: string;
  description: string;
  category: 'navigation' | 'safety' | 'project' | 'task' | 'general';
}

// Available voice commands
export const VOICE_COMMANDS: VoiceCommand[] = [
  // Navigation commands
  {
    id: 'go_dashboard',
    phrases: ['go to dashboard', 'open dashboard', 'show dashboard', 'dashboard'],
    action: 'NAVIGATE_DASHBOARD',
    description: 'Navigate to dashboard',
    category: 'navigation',
  },
  {
    id: 'go_projects',
    phrases: ['go to projects', 'open projects', 'show projects', 'my projects'],
    action: 'NAVIGATE_PROJECTS',
    description: 'Navigate to projects',
    category: 'navigation',
  },
  {
    id: 'go_tasks',
    phrases: ['go to tasks', 'open tasks', 'show tasks', 'my tasks'],
    action: 'NAVIGATE_TASKS',
    description: 'Navigate to tasks',
    category: 'navigation',
  },
  {
    id: 'go_safety',
    phrases: ['go to safety', 'open safety', 'safety monitor', 'safety status'],
    action: 'NAVIGATE_SAFETY',
    description: 'Navigate to safety monitor',
    category: 'navigation',
  },

  // Safety commands
  {
    id: 'emergency',
    phrases: ['emergency', 'help', 'sos', 'call for help', 'i need help'],
    action: 'TRIGGER_EMERGENCY',
    description: 'Trigger emergency alert',
    category: 'safety',
  },
  {
    id: 'start_monitoring',
    phrases: ['start monitoring', 'enable safety', 'turn on safety', 'start safety'],
    action: 'START_SAFETY_MONITORING',
    description: 'Start safety monitoring',
    category: 'safety',
  },
  {
    id: 'stop_monitoring',
    phrases: ['stop monitoring', 'disable safety', 'turn off safety', 'stop safety'],
    action: 'STOP_SAFETY_MONITORING',
    description: 'Stop safety monitoring',
    category: 'safety',
  },
  {
    id: 'im_okay',
    phrases: ['i am okay', "i'm okay", 'i am fine', "i'm fine", 'all clear', 'false alarm'],
    action: 'ACKNOWLEDGE_ALERT',
    description: 'Acknowledge safety alert',
    category: 'safety',
  },

  // Project commands
  {
    id: 'new_project',
    phrases: ['new project', 'create project', 'add project', 'start project'],
    action: 'CREATE_PROJECT',
    description: 'Start project creation wizard',
    category: 'project',
  },
  {
    id: 'project_status',
    phrases: ['project status', 'how are my projects', 'project overview', 'project summary'],
    action: 'READ_PROJECT_STATUS',
    description: 'Read project status summary',
    category: 'project',
  },

  // Task commands
  {
    id: 'new_task',
    phrases: ['new task', 'create task', 'add task'],
    action: 'CREATE_TASK',
    description: 'Create a new task',
    category: 'task',
  },
  {
    id: 'task_status',
    phrases: ['task status', 'my tasks today', 'pending tasks', 'task summary'],
    action: 'READ_TASK_STATUS',
    description: 'Read task status summary',
    category: 'task',
  },
  {
    id: 'complete_task',
    phrases: ['complete task', 'task done', 'mark complete', 'finish task'],
    action: 'COMPLETE_TASK',
    description: 'Mark current task as complete',
    category: 'task',
  },

  // General commands
  {
    id: 'what_can_i_say',
    phrases: ['what can i say', 'help me', 'voice commands', 'available commands'],
    action: 'LIST_COMMANDS',
    description: 'List available voice commands',
    category: 'general',
  },
  {
    id: 'read_notifications',
    phrases: ['read notifications', 'any notifications', 'check notifications', 'alerts'],
    action: 'READ_NOTIFICATIONS',
    description: 'Read pending notifications',
    category: 'general',
  },
  {
    id: 'sync_data',
    phrases: ['sync data', 'synchronize', 'refresh data', 'update data'],
    action: 'SYNC_DATA',
    description: 'Sync offline data',
    category: 'general',
  },
];

export interface VoiceServiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  lastTranscript: string;
  lastCommand: VoiceCommand | null;
  error: string | null;
  isAvailable: boolean;
}

type CommandHandler = (command: VoiceCommand, transcript: string) => void;

class VoiceCommandService {
  private listeners: ((state: VoiceServiceState) => void)[] = [];
  private commandHandler: CommandHandler | null = null;
  private recognitionTimeout: NodeJS.Timeout | null = null;

  private state: VoiceServiceState = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    lastTranscript: '',
    lastCommand: null,
    error: null,
    isAvailable: false,
  };

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    // Speech synthesis is available on most platforms
    this.state.isAvailable = true;
    this.notifyListeners();
  }

  subscribe(listener: (state: VoiceServiceState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  setCommandHandler(handler: CommandHandler) {
    this.commandHandler = handler;
  }

  // Text-to-speech functions
  async speak(text: string, options?: Speech.SpeechOptions) {
    if (this.state.isSpeaking) {
      await Speech.stop();
    }

    this.state.isSpeaking = true;
    this.notifyListeners();

    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        ...options,
        onDone: () => {
          this.state.isSpeaking = false;
          this.notifyListeners();
          resolve();
        },
        onError: () => {
          this.state.isSpeaking = false;
          this.notifyListeners();
          resolve();
        },
      });
    });
  }

  async stopSpeaking() {
    await Speech.stop();
    this.state.isSpeaking = false;
    this.notifyListeners();
  }

  // Process text as if it were voice input (for testing without mic)
  async processText(text: string) {
    this.state.isProcessing = true;
    this.state.lastTranscript = text;
    this.notifyListeners();

    const normalizedText = text.toLowerCase().trim();
    const matchedCommand = this.findMatchingCommand(normalizedText);

    if (matchedCommand) {
      this.state.lastCommand = matchedCommand;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (this.commandHandler) {
        this.commandHandler(matchedCommand, normalizedText);
      }

      // Provide audio feedback
      await this.speak(`Executing: ${matchedCommand.description}`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await this.speak("Sorry, I didn't understand that command. Say 'what can I say' for available commands.");
    }

    this.state.isProcessing = false;
    this.notifyListeners();

    return matchedCommand;
  }

  private findMatchingCommand(transcript: string): VoiceCommand | null {
    for (const command of VOICE_COMMANDS) {
      for (const phrase of command.phrases) {
        if (transcript.includes(phrase.toLowerCase())) {
          return command;
        }
      }
    }
    return null;
  }

  // Speak available commands by category
  async speakAvailableCommands(category?: VoiceCommand['category']) {
    let commands = VOICE_COMMANDS;
    if (category) {
      commands = commands.filter(c => c.category === category);
    }

    const commandList = commands.map(c => c.phrases[0]).join(', ');
    await this.speak(`Available commands: ${commandList}`);
  }

  // Speak project status summary
  async speakProjectStatus(stats: { active: number; completed: number; totalBudget: number }) {
    const summary = `You have ${stats.active} active projects and ${stats.completed} completed. 
      Total budget across all projects is $${stats.totalBudget.toLocaleString()}.`;
    await this.speak(summary);
  }

  // Speak task status summary
  async speakTaskStatus(stats: { pending: number; completed: number; overdue: number }) {
    let summary = `You have ${stats.pending} pending tasks and ${stats.completed} completed today.`;
    if (stats.overdue > 0) {
      summary += ` Warning: ${stats.overdue} tasks are overdue.`;
    }
    await this.speak(summary);
  }

  // Speak safety alert
  async speakSafetyAlert(alert: { type: string; message: string }) {
    await this.speak(`Safety Alert: ${alert.message}. Say 'I am okay' to acknowledge.`, {
      pitch: 1.2,
      rate: 1.0,
    });
  }

  // Get command suggestions based on partial input
  getSuggestions(partialText: string): VoiceCommand[] {
    if (!partialText) return [];
    
    const normalized = partialText.toLowerCase().trim();
    return VOICE_COMMANDS.filter(command =>
      command.phrases.some(phrase => phrase.startsWith(normalized) || normalized.startsWith(phrase))
    ).slice(0, 5);
  }

  getState(): VoiceServiceState {
    return { ...this.state };
  }
}

// Singleton instance
export const voiceCommandService = new VoiceCommandService();

// React Hook
export function useVoiceCommands(onCommand?: CommandHandler) {
  const [state, setState] = useState<VoiceServiceState>(voiceCommandService.getState());

  useEffect(() => {
    const unsubscribe = voiceCommandService.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (onCommand) {
      voiceCommandService.setCommandHandler(onCommand);
    }
  }, [onCommand]);

  return {
    ...state,
    speak: (text: string) => voiceCommandService.speak(text),
    stopSpeaking: () => voiceCommandService.stopSpeaking(),
    processText: (text: string) => voiceCommandService.processText(text),
    speakAvailableCommands: (category?: VoiceCommand['category']) => 
      voiceCommandService.speakAvailableCommands(category),
    speakProjectStatus: (stats: any) => voiceCommandService.speakProjectStatus(stats),
    speakTaskStatus: (stats: any) => voiceCommandService.speakTaskStatus(stats),
    getSuggestions: (text: string) => voiceCommandService.getSuggestions(text),
    commands: VOICE_COMMANDS,
  };
}

export default voiceCommandService;
